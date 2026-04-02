package com.bookhive.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebConfig {
    @Bean
    public Filter timingFilter() {
        return (ServletRequest request, ServletResponse response, FilterChain chain) -> {
            long start = System.currentTimeMillis();
            chain.doFilter(request, response);
            long duration = System.currentTimeMillis() - start;
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setHeader("X-Response-Time", duration + "ms");
            httpResponse.setHeader("X-Content-Type-Options", "nosniff");
            httpResponse.setHeader("X-Frame-Options", "DENY");
            httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
        };
    }
}
