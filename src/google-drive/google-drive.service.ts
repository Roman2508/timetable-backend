const fs = require('fs');
const path = require('path');
const stream = require('stream');
const process = require('process');
const { google } = require('googleapis');

// import { JWT } from 'google-auth-library';
import { Injectable } from '@nestjs/common';
import { UpdateGoogleDriveFolderDto } from './dto/update-google-drive.dto';
import { CreateGoogleDriveFolderDto } from './dto/create-google-drive.dto';

const CREDENTIALS_PATH = path.join(process.cwd(), 'src/google-drive/client_secret.json');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const KEY_FILE = path.join(process.cwd(), 'src/google-drive/client_secret.json');

@Injectable()
export class GoogleDriveService {
  // private googleClient: any;

  // constructor() {
  //   const key = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));

  //   const auth = new JWT({
  //     email: key.client_email,
  //     key: key.private_key,
  //     scopes: SCOPES,
  //     subject: 'admin.calendar@pharm.zt.ua',
  //   });

  //   // @ts-ignore
  //   this.googleClient = google.admin({ version: 'v3', auth });
  // }

  async authorize() {
    const content = await fs.promises.readFile(CREDENTIALS_PATH);
    const apiKeys = JSON.parse(content);

    const auth = new google.auth.GoogleAuth({
      credentials: apiKeys,
      scopes: SCOPES,
    });
    const drive = google.drive({ version: 'v3', auth });
    return drive;
  }

  async createFile(file: any, folderId: string) {
    const drive = await this.authorize();

    const originalName = file.originalname;
    const mimeType = file.mimetype;

    const fileMetaData = {
      name: originalName,
      parents: [folderId],
    };

    const fileStream = new stream.PassThrough();
    fileStream.end(file.buffer);

    const media = {
      mimeType: mimeType,
      body: fileStream,
    };

    try {
      const file = await drive.files.create({ resource: fileMetaData, media, fields: 'id' });
      // Загальний доступ до файла
      await drive.permissions.create({ fileId: file.data.id, resource: { type: 'anyone', role: 'reader' } });

      return { id: file.data.id, name: originalName, mimeType };

      // fila.data:
      // {
      //   kind: 'drive#file',
      //   id: '1d1srw_FvRVPvEKRI2TInrZxQJ2p2jDgX',
      //   name: ' ',
      //   mimeType: 'text/plain'
      // }

      // download file link:
      // https://drive.usercontent.google.com/download?id=1d1srw_FvRVPvEKRI2TInrZxQJ2p2jDgX&export=download&authuser=0&confirm=t
    } catch (err) {
      throw err;
    }
  }

  async createFolder(dto: CreateGoogleDriveFolderDto) {
    try {
      const drive = await this.authorize();

      const fileMetadata = {
        name: dto.name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: ['1Dz0pf5j6glmoTMJT6wgt7XfHppQmKnDq'],
      };

      const file = await drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      });

      // file.data.id === new folder ID
      return file.data.id;
    } catch (err) {
      console.error('Error creating the folder:', err.message);
    }
  }

  async updateFolderName(dto: UpdateGoogleDriveFolderDto) {
    // When rename teacher
    try {
      const drive = await this.authorize();

      const fileMetadata = { name: dto.name };

      const folder = await drive.files.update({
        fileId: dto.folderId,
        resource: fileMetadata,
        fields: 'id, name',
      });

      return { folderId: dto.folderId, name: folder.data.name };
    } catch (err) {
      console.error('Error updating the folder name:', err.message);
    }
  }

  async deleteFile(fileId: string) {
    try {
      const drive = await this.authorize();
      await drive.files.delete({ fileId: fileId });
      return fileId;
    } catch (err) {
      console.error('Error:', err.message);
    }
  }

  async deleteFolder(folderId: string) {
    try {
      const drive = await this.authorize();
      await drive.files.delete({ fileId: folderId });
      return folderId;
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
}
