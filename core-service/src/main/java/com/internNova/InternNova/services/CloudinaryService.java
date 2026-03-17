package com.internNova.InternNova.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        File convFile = File.createTempFile("upload_", extension);
        try (FileOutputStream fos = new FileOutputStream(convFile)) {
            fos.write(file.getBytes());
        }
        
        String resourceType = "auto";
        if (extension.equalsIgnoreCase(".pdf") || extension.equalsIgnoreCase(".doc") || extension.equalsIgnoreCase(".docx")) {
            resourceType = "raw";
        }
        
        Map<String, Object> params = ObjectUtils.asMap(
            "resource_type", resourceType
        );
        Map<String, Object> uploadResult = cloudinary.uploader().upload(convFile, params);
        convFile.delete();
        
        return uploadResult.get("secure_url").toString();
    }

    public void deleteFile(String url) throws IOException {
        String publicId = extractPublicId(url);
        if (publicId != null) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        }
    }

    private String extractPublicId(String url) {
        try {
            int lastSlash = url.lastIndexOf("/");
            int lastDot = url.lastIndexOf(".");
            if (lastSlash != -1 && lastDot != -1 && lastDot > lastSlash) {
                return url.substring(lastSlash + 1, lastDot);
            }
        } catch (Exception e) {

        }
        return null;
    }
}
