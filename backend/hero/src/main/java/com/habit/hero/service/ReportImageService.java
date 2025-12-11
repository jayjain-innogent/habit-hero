package com.habit.hero.service;

import org.springframework.web.multipart.MultipartFile;

public interface ReportImageService {

    String uploadReportImage(MultipartFile imageFile, Long userId);
}
