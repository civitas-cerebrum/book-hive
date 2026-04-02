package com.bookhive.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.io.IOException;

@Configuration
public class WebConfig {
    @Bean
    public Filter timingFilter() {
        return (ServletRequest request, ServletResponse response, FilterChain chain) -> {
            long start = System.currentTimeMillis();
            chain.doFilter(request, response);
            long duration = System.currentTimeMillis() - start;
            ((HttpServletResponse) response).setHeader("X-Response-Time", duration + "ms");
        };
    }
}
