// demo\src\main\java\com\devall\agenticdevops\DevAllApplication.java
package com.devall.agenticdevops;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class DevAllApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevAllApplication.class, args);
    }
}