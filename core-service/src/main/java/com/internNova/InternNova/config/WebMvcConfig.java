package com.internNova.InternNova.config;

import com.internNova.InternNova.security.TalentAuthInterceptor;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private ApplicationContext applicationContext;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        try {
            TalentAuthInterceptor interceptor =
                    applicationContext.getBean(TalentAuthInterceptor.class);
            registry.addInterceptor(interceptor)
                    .addPathPatterns("/talent/v1/**");
        } catch (BeansException ignored) {
        }
    }
}
