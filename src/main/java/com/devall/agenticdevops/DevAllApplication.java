package com.devall.agenticdevops;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication 
public class DevAllApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevAllApplication.class, args);
        System.out.println("DevAll Agentic DevOps starting...");
    }
}