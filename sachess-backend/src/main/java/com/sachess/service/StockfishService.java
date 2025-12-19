package com.sachess.service;

import com.sachess.dto.GameMessage;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.concurrent.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class StockfishService {

    @Value("${stockfish.path:stockfish}")
    private String stockfishPath;

    @Value("${stockfish.threads:2}")
    private int threads;

    @Value("${stockfish.hash:128}")
    private int hashSize;

    @Value("${stockfish.depth:20}")
    private int defaultDepth;

    private Process stockfishProcess;
    private BufferedReader reader;
    private BufferedWriter writer;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private boolean isReady = false;

    @PostConstruct
    public void init() {
        try {
            startEngine();
        } catch (Exception e) {
            log.warn("Stockfish engine not available: {}. Analysis features will be disabled.", e.getMessage());
        }
    }

    @PreDestroy
    public void cleanup() {
        stopEngine();
        executor.shutdown();
    }

    private void startEngine() throws IOException {
        ProcessBuilder pb = new ProcessBuilder(stockfishPath);
        pb.redirectErrorStream(true);
        stockfishProcess = pb.start();

        reader = new BufferedReader(new InputStreamReader(stockfishProcess.getInputStream()));
        writer = new BufferedWriter(new OutputStreamWriter(stockfishProcess.getOutputStream()));

        sendCommand("uci");
        waitForResponse("uciok");

        sendCommand("setoption name Threads value " + threads);
        sendCommand("setoption name Hash value " + hashSize);

        sendCommand("isready");
        waitForResponse("readyok");

        isReady = true;
        log.info("Stockfish engine initialized successfully");
    }

    private void stopEngine() {
        if (stockfishProcess != null && stockfishProcess.isAlive()) {
            try {
                sendCommand("quit");
                stockfishProcess.waitFor(5, TimeUnit.SECONDS);
            } catch (Exception e) {
                stockfishProcess.destroyForcibly();
            }
        }
    }

    private void sendCommand(String command) throws IOException {
        if (writer != null) {
            writer.write(command + "\n");
            writer.flush();
            log.debug("Sent to Stockfish: {}", command);
        }
    }

    private void waitForResponse(String expected) throws IOException {
        String line;
        while ((line = reader.readLine()) != null) {
            log.debug("Stockfish: {}", line);
            if (line.contains(expected)) {
                break;
            }
        }
    }

    public CompletableFuture<GameMessage.AnalysisResult> analyzePosition(String fen, int depth) {
        if (!isReady) {
            return CompletableFuture.completedFuture(null);
        }

        return CompletableFuture.supplyAsync(() -> {
            try {
                return performAnalysis(fen, depth > 0 ? depth : defaultDepth);
            } catch (Exception e) {
                log.error("Error analyzing position: {}", e.getMessage());
                return null;
            }
        }, executor);
    }

    public CompletableFuture<GameMessage.AnalysisResult> analyzePosition(String fen) {
        return analyzePosition(fen, defaultDepth);
    }

    private synchronized GameMessage.AnalysisResult performAnalysis(String fen, int depth) throws IOException {
        sendCommand("position fen " + fen);
        sendCommand("go depth " + depth);

        GameMessage.AnalysisResult result = GameMessage.AnalysisResult.builder().build();
        String line;
        String bestMove = null;
        int evaluation = 0;
        String pv = "";
        String mate = null;
        int currentDepth = 0;

        Pattern scorePattern = Pattern.compile("score (cp|mate) (-?\\d+)");
        Pattern pvPattern = Pattern.compile("pv (.+)");
        Pattern depthPattern = Pattern.compile("depth (\\d+)");
        Pattern bestMovePattern = Pattern.compile("bestmove (\\w+)");

        while ((line = reader.readLine()) != null) {
            log.debug("Stockfish: {}", line);

            if (line.startsWith("bestmove")) {
                Matcher matcher = bestMovePattern.matcher(line);
                if (matcher.find()) {
                    bestMove = matcher.group(1);
                }
                break;
            }

            if (line.startsWith("info")) {
                Matcher depthMatcher = depthPattern.matcher(line);
                if (depthMatcher.find()) {
                    currentDepth = Integer.parseInt(depthMatcher.group(1));
                }

                Matcher scoreMatcher = scorePattern.matcher(line);
                if (scoreMatcher.find()) {
                    String scoreType = scoreMatcher.group(1);
                    int scoreValue = Integer.parseInt(scoreMatcher.group(2));

                    if ("cp".equals(scoreType)) {
                        evaluation = scoreValue;
                        mate = null;
                    } else if ("mate".equals(scoreType)) {
                        mate = String.valueOf(scoreValue);
                        evaluation = scoreValue > 0 ? 10000 : -10000;
                    }
                }

                Matcher pvMatcher = pvPattern.matcher(line);
                if (pvMatcher.find()) {
                    pv = pvMatcher.group(1);
                }
            }
        }

        return GameMessage.AnalysisResult.builder()
                .bestMove(bestMove)
                .evaluation(evaluation)
                .pv(pv)
                .depth(currentDepth)
                .mate(mate)
                .build();
    }

    public CompletableFuture<String> getBestMove(String fen, int timeMs) {
        if (!isReady) {
            return CompletableFuture.completedFuture(null);
        }

        return CompletableFuture.supplyAsync(() -> {
            try {
                return performGetBestMove(fen, timeMs);
            } catch (Exception e) {
                log.error("Error getting best move: {}", e.getMessage());
                return null;
            }
        }, executor);
    }

    private synchronized String performGetBestMove(String fen, int timeMs) throws IOException {
        sendCommand("position fen " + fen);
        sendCommand("go movetime " + timeMs);

        String line;
        Pattern bestMovePattern = Pattern.compile("bestmove (\\w+)");

        while ((line = reader.readLine()) != null) {
            if (line.startsWith("bestmove")) {
                Matcher matcher = bestMovePattern.matcher(line);
                if (matcher.find()) {
                    return matcher.group(1);
                }
                break;
            }
        }
        return null;
    }

    public boolean isAvailable() {
        return isReady;
    }

    public void newGame() {
        if (isReady) {
            try {
                sendCommand("ucinewgame");
                sendCommand("isready");
                waitForResponse("readyok");
            } catch (IOException e) {
                log.error("Error starting new game: {}", e.getMessage());
            }
        }
    }
}
