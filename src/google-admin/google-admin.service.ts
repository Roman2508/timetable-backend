import * as fs from 'fs';
const path = require('path');
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleAdminService {
  private adminClient: any;

  constructor() {
    const keyFile = path.join(process.cwd(), 'src/google-admin/service-account-key.json');
    const scopes = [
      'https://www.googleapis.com/auth/admin.directory.user',
      'https://www.googleapis.com/auth/admin.directory.user.readonly',
    ];

    const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));

    const client = new JWT({
      email: key.client_email,
      key: key.private_key,
      scopes,
      subject: 'admin.calendar@pharm.zt.ua', // email администратора домена
    });

    // @ts-ignore
    this.adminClient = google.admin({ version: 'directory_v1', auth: client });
  }

  // async listUsers() {
  //   const res = await this.adminClient.users.list({
  //     customer: 'my_customer',
  //     maxResults: 10,
  //     orderBy: 'email',
  //   });
  //   return res.data.users;
  // }

  async getUserPhotoByEmail(email: string): Promise<string | undefined> {
    try {
      const res = await this.adminClient.users.get({
        userKey: email,
      });

      const user = res.data;

      return user.thumbnailPhotoUrl;
    } catch (error) {
      if (error.code === 404) {
        throw new Error(`User with email ${email} not found.`);
      } else {
        throw new Error(`Failed to get user: ${error.message}`);
      }
    }
  }
}
