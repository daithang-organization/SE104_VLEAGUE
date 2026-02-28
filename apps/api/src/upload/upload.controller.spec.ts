import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';

describe('UploadController', () => {
  let controller: UploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should return url and filename on successful upload', () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'photo.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '/uploads',
        filename: '1234567890-987654321.jpg',
        path: '/uploads/1234567890-987654321.jpg',
        size: 1024 * 100,
      } as Express.Multer.File;

      const result = controller.uploadImage(mockFile);

      expect(result).toEqual({
        url: '/uploads/1234567890-987654321.jpg',
        filename: '1234567890-987654321.jpg',
      });
    });

    it('should throw BadRequestException when no file provided', () => {
      expect(() => controller.uploadImage(undefined as any)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when file is null', () => {
      expect(() => controller.uploadImage(null as any)).toThrow(
        BadRequestException,
      );
    });

    it('should return correct url format with /uploads/ prefix', () => {
      const mockFile = {
        filename: 'test-image.png',
      } as Express.Multer.File;

      const result = controller.uploadImage(mockFile);

      expect(result.url).toBe('/uploads/test-image.png');
      expect(result.url).toMatch(/^\/uploads\//);
    });

    it('should return the multer-generated filename', () => {
      const mockFile = {
        originalname: 'my-photo.jpeg',
        filename: '1709000000-123456789.jpeg',
      } as Express.Multer.File;

      const result = controller.uploadImage(mockFile);

      expect(result.filename).toBe('1709000000-123456789.jpeg');
      expect(result.filename).not.toBe('my-photo.jpeg');
    });
  });
});
