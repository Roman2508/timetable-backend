// import * as fs from 'fs';
const fs = require('fs');
const path = require('path');
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { Injectable } from '@nestjs/common';

// const SCOPES = [
//   'https://www.googleapis.com/auth/admin.directory.user',
//   'https://www.googleapis.com/auth/admin.directory.user.readonly',
// ];
// const CREDENTIALS_PATH = path.join(process.cwd(), 'src/google-admin/service-account-key.json');

const KEY_FILE = path.join(process.cwd(), 'src/google-admin/service-account-key.json');
const SCOPES = [
  'https://www.googleapis.com/auth/admin.directory.user',
  'https://www.googleapis.com/auth/admin.directory.user.readonly',
];

@Injectable()
export class GoogleAdminService {
  private googleClient: any;

  constructor() {
    const key = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));

    const client = new JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: SCOPES,
      subject: 'admin.calendar@pharm.zt.ua',
    });

    // @ts-ignore
    this.googleClient = google.admin({ version: 'directory_v1', auth: client });

    // const oauth2Client = new google.auth.OAuth2(
    //   keyFile.client_id,
    //   keyFile.YOUR_CLIENT_SECRET,
    //   keyFile.YOUR_REDIRECT_URL
    // );
    // set auth as a global default
    // google.options({
    //   auth: oauth2Client
    // })
  }

  // async authorize() {
  //   const content = await fs.promises.readFile(CREDENTIALS_PATH);
  //   const apiKeys = JSON.parse(content);

  //   const auth = new google.auth.GoogleAuth({
  //     credentials: apiKeys,
  //     scopes: SCOPES,
  //   });
  //   const admin = google.admin({ auth, version: 'directory_v1' });
  //   return admin;
  // }

  async listUsers() {
    const res = await this.googleClient.users.list({
      customer: 'my_customer',
      maxResults: 20,
      orderBy: 'email',
    });
    return res.data.users;
  }

  async getUserPhotoByEmail(email: string): Promise<string | null> {
    try {
      // const admin = await this.authorize();
      // console.log(admin);
      // const user = await admin.users.get({ userKey: email });
      // return user.data.thumbnailPhotoUrl;

      const res = await this.googleClient.users.get({
        userKey: email,
      });
      const user = res.data;
      console.log(user);
      return user.thumbnailPhotoUrl;
    } catch (error) {
      if (error.code === 404) {
        // throw new Error(`User with email ${email} not found.`);
        return null;
      } else {
        throw new Error(`Failed to get user: ${error.message}`);
      }
    }
  }
}
