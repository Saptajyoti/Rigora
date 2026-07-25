import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const directoryName = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDirectory = path.resolve(directoryName, '../uploads');
fs.mkdirSync(uploadsDirectory, { recursive: true });

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_request, _file, callback) => callback(null, uploadsDirectory),
    filename: (_request, file, callback) => {
      callback(
        null,
        `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`,
      );
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) =>
    callback(null, file.mimetype.startsWith('image/')),
});
