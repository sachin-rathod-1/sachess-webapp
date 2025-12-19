package com.sachess;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SachessApplication {
    public static void main(String[] args) {
        SpringApplication.run(SachessApplication.class, args);
    }
}
