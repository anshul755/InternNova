package com.internNova.InternNova.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.internNova.InternNova.services.JobService;

@Component
public class JobScheduler {

    @Autowired
    private JobService jobService;

    // Runs every day at midnight server time
    @Scheduled(cron = "0 0 0 * * ?")
    public void expireJobsDaily() {
        jobService.expireJobs();
    }
}
