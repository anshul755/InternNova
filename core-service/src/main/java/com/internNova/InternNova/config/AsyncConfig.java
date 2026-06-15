package com.internNova.InternNova.config;

import java.util.concurrent.Executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * Configures the async executor used by {@code @Async} methods throughout the
 * application.
 *
 * Without an explicit executor Spring falls back to {@code SimpleAsyncTaskExecutor}
 * which creates an unpooled thread per task — that thread may be silently discarded
 * under load. A pooled executor gives us bounded queues, rejection logging, and
 * named threads that are visible in thread dumps.
 */
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    private static final Logger log = LoggerFactory.getLogger(AsyncConfig.class);

    @Bean(name = "applicationEvaluationExecutor")
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("ai-eval-");
        executor.setRejectedExecutionHandler((runnable, rejectedExecutor) -> {
            log.warn("AI evaluation task rejected — executor is saturated. "
                    + "The application will stay in APPLIED status.");
        });
        executor.setWaitForTasksToCompleteOnShutdown(false);
        executor.initialize();
        return executor;
    }
}
