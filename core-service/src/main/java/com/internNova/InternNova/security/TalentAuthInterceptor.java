package com.internNova.InternNova.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TalentAuthInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        String method = request.getMethod();
        String path = request.getRequestURI();

        if ("POST".equalsIgnoreCase(method)
                && (path.endsWith("/talent/v1") || path.endsWith("/talent/v1/"))) {
            return true;
        }

        if ("GET".equalsIgnoreCase(method) || "OPTIONS".equalsIgnoreCase(method)) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
                try {
                    Claims claims = jwtUtil.verifyAndParse(
                            authHeader.substring(BEARER_PREFIX.length()));
                    request.setAttribute("userId", jwtUtil.getUserId(claims));
                    request.setAttribute("userRole", jwtUtil.getUserRole(claims));
                } catch (JwtException ignored) {
                }
            }
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Authorization header missing or malformed.\"}"
            );
            return false;
        }

        try {
            Claims claims = jwtUtil.verifyAndParse(
                    authHeader.substring(BEARER_PREFIX.length()));
            request.setAttribute("userId", jwtUtil.getUserId(claims));
            request.setAttribute("userRole", jwtUtil.getUserRole(claims));
            return true;
        } catch (JwtException e) {
            response.setStatus(401);
            response.setContentType("application/json");
            String msg = e.getMessage() != null && e.getMessage().contains("expired")
                    ? "Access token has expired. Please refresh your session."
                    : "Invalid access token.";
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"" + msg + "\"}"
            );
            return false;
        }
    }
}
