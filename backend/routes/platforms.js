import express from 'express';
import axios from 'axios';
import { google } from 'googleapis';
import { authMiddleware, projectAccessMiddleware } from '../utils/auth.js';
import { storeTokenByProjectID, retrieveTokenByProjectID, removeTokenByProjectID } from '../utils/token_manager.js';
import { storeOAuthState, retrieveOAuthState } from '../utils/oauth_states.js';
import YouTubeManager from '../platforms/Youtube.js';
import InstagramManager from '../platforms/Instagram.js';
import FacebookManager from '../platforms/Facebook.js';
import TikTokManager from '../platforms/Tiktok.js';
import XManager from '../platforms/X.js';
import RedditManager from '../platforms/Reddit.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const router = express.Router();
const baseDomain = process.env.MODE === 'prod' ? 'https://reelmia.com' : `http://localhost:5185`;

const youTubeManager = new YouTubeManager();
const tiktokManager = new TikTokManager();
const instagramManager = new InstagramManager();
const facebookManager = new FacebookManager();
const xManager = new XManager();
const redditManager = new RedditManager();

// ============================================
// ACCOUNT STATUS & CONNECTION
// ============================================

router.get('/accounts/status', authMiddleware, projectAccessMiddleware, async (req, res) => {
  const PROJECT_ID = req.query.project_id;

  try {
    const accountDetails = {
      youtube: null,
      tiktok: null,
      instagram: null,
      facebook: null,
      x: null,
      reddit: null
    };

    try {
      const youtubeToken = await retrieveTokenByProjectID('youtube_token', PROJECT_ID);
      const youtubeInfo = await retrieveTokenByProjectID('youtube_channel_info', PROJECT_ID);
      if (youtubeToken && youtubeToken.refresh_token) {
        accountDetails.youtube = {
          name: youtubeInfo?.channelTitle || 'YouTube Channel',
          type: 'channel'
        };
      }
    } catch (err) {
      // Not connected
    }

    try {
      const tiktokToken = await retrieveTokenByProjectID('tiktok_token', PROJECT_ID);
      const tiktokInfo = await retrieveTokenByProjectID('tiktok_user_info', PROJECT_ID);
      if (tiktokToken && tiktokToken.access_token) {
        accountDetails.tiktok = {
          name: tiktokInfo?.display_name || tiktokInfo?.username || 'TikTok User',
          username: tiktokInfo?.username,
          type: 'user'
        };
      }
    } catch (err) {
      // Not connected
    }

    try {
      const instagramAccount = await retrieveTokenByProjectID('instagram_business_account', PROJECT_ID);
      if (instagramAccount && instagramAccount.username) {
        accountDetails.instagram = {
          name: instagramAccount.name || instagramAccount.username,
          username: instagramAccount.username,
          type: 'business'
        };
      }
    } catch (err) {
      // Not connected
    }

    try {
      const facebookAccounts = await retrieveTokenByProjectID('facebook_accounts', PROJECT_ID);
      if (facebookAccounts && facebookAccounts.data && facebookAccounts.data.length > 0) {
        const firstAccount = facebookAccounts.data[0];
        accountDetails.facebook = {
          name: firstAccount.name || 'Facebook Page',
          type: 'page'
        };
      }
    } catch (err) {
      // Not connected
    }

    try {
      const xToken = await retrieveTokenByProjectID('x_token', PROJECT_ID);
      const xInfo = await retrieveTokenByProjectID('x_user_info', PROJECT_ID);
      if (xToken && xToken.access_token) {
        accountDetails.x = {
          name: xInfo?.name || 'X User',
          username: xInfo?.username,
          type: 'user'
        };
      }
    } catch (err) {
      // Not connected
    }

    try {
      const redditToken = await retrieveTokenByProjectID('reddit_token', PROJECT_ID);
      const redditInfo = await retrieveTokenByProjectID('reddit_user_info', PROJECT_ID);
      if (redditToken && redditToken.access_token) {
        accountDetails.reddit = {
          name: redditInfo?.name || 'Reddit User',
          type: 'user'
        };
      }
    } catch (err) {
      // Not connected
    }

    res.json(accountDetails);
  } catch (error) {
    console.error('Error checking account status:', error);
    res.status(500).json({ error: 'Error checking account status' });
  }
});

router.get('/connected-platforms', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const PROJECT_ID = req.project.id;
    const connectedPlatforms = [];

    try {
      const youtubeToken = await retrieveTokenByProjectID('youtube_token', PROJECT_ID);
      if (youtubeToken && youtubeToken.refresh_token) {
        connectedPlatforms.push('youtube');
      }
    } catch (err) {
      // Not connected
    }

    try {
      const tiktokToken = await retrieveTokenByProjectID('tiktok_token', PROJECT_ID);
      if (tiktokToken && tiktokToken.access_token) {
        connectedPlatforms.push('tiktok');
      }
    } catch (err) {
      // Not connected
    }

    try {
      const instagramToken = await retrieveTokenByProjectID('instagram_token', PROJECT_ID);
      const instagramAccount = await retrieveTokenByProjectID('instagram_business_account', PROJECT_ID);
      if (instagramToken && instagramAccount) {
        connectedPlatforms.push('instagram');
      }
    } catch (err) {
      // Not connected
    }

    try {
      const facebookToken = await retrieveTokenByProjectID('facebook_token', PROJECT_ID);
      const facebookAccounts = await retrieveTokenByProjectID('facebook_accounts', PROJECT_ID);

      console.log('---------------------------------------------------- \n\n\n');
      console.log('Facebook Token:', facebookToken);
      console.log('Facebook Accounts:', facebookAccounts);
      console.log('---------------------------------------------------- \n\n\n');

      if (facebookToken && facebookAccounts) {
        connectedPlatforms.push('facebook');
      }
    } catch (err) {
      // Not connected
    }

    try {
      const xToken = await retrieveTokenByProjectID('x_token', PROJECT_ID);
      if (xToken && xToken.access_token) {
        connectedPlatforms.push('x');
      }
    } catch (err) {
      // Not connected
    }

    try {
      const redditToken = await retrieveTokenByProjectID('reddit_token', PROJECT_ID);
      if (redditToken && redditToken.access_token) {
        connectedPlatforms.push('reddit');
      }
    } catch (err) {
      // Not connected
    }

    res.json({ platforms: connectedPlatforms });
  } catch (error) {
    console.error('Error getting connected platforms:', error);
    res.status(500).json({ error: 'Error getting connected platforms' });
  }
});

router.post('/connect/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const PROJECT_ID = req.query.project_id || 1;

    switch (platform) {
      case 'youtube':
        const result = await youTubeManager.authorize(PROJECT_ID);
        if (result.authUrl) {
          return res.json({ authUrl: result.authUrl });
        } else {
          return res.status(500).json({ error: 'Failed to generate auth URL' });
        }

      case 'instagram':
        instagramManager.projectId = PROJECT_ID;
        const instagramAuth = instagramManager.generateAuthUrl();
        if (instagramAuth.auth_url) {
          return res.json({ authUrl: instagramAuth.auth_url });
        } else {
          return res.status(500).json({ error: 'Failed to generate auth URL' });
        }

      case 'facebook':
        facebookManager.projectId = PROJECT_ID;
        const facebookAuth = facebookManager.generateAuthUrl();
        if (facebookAuth.auth_url) {
          return res.json({ authUrl: facebookAuth.auth_url });
        } else {
          return res.status(500).json({ error: 'Failed to generate auth URL' });
        }

      case 'tiktok':
        tiktokManager.projectId = PROJECT_ID;
        const tiktokResult = await tiktokManager.authorize();
        if (tiktokResult.authUrl) {
          return res.json({ authUrl: tiktokResult.authUrl });
        } else {
          return res.status(500).json({ error: 'Failed to generate auth URL' });
        }

      case 'x':
        xManager.projectId = PROJECT_ID;
        const xResult = await xManager.authorize();
        if (xResult.authUrl) {
          return res.json({ authUrl: xResult.authUrl });
        } else {
          return res.status(500).json({ error: 'Failed to generate auth URL' });
        }

      case 'reddit':
        console.log('Connecting to Reddit for project ID:', PROJECT_ID);
        redditManager.projectId = PROJECT_ID;
        const redditResult = await redditManager.authorize();
        if (redditResult.authUrl) {
          return res.json({ authUrl: redditResult.authUrl });
        } else {
          return res.status(500).json({ error: 'Failed to generate auth URL' });
        }

      default:
        return res.status(400).json({ error: 'Unsupported platform' });
    }
  } catch (error) {
    console.error('Error connecting to platform:', error);
    res.status(500).json({ error: 'Error connecting to platform' });
  }
});

router.post('/disconnect/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const PROJECT_ID = req.query.project_id || 1;

    switch (platform) {
      case 'youtube':
        removeTokenByProjectID('youtube_token', PROJECT_ID);
        removeTokenByProjectID('youtube_code', PROJECT_ID);
        removeTokenByProjectID('youtube_channel_info', PROJECT_ID);
        return res.json({ message: 'Disconnected from YouTube successfully' });

      case 'instagram':
        removeTokenByProjectID('instagram_business_account', PROJECT_ID);
        removeTokenByProjectID('instagram_token', PROJECT_ID);
        removeTokenByProjectID('instagram_code', PROJECT_ID);
        removeTokenByProjectID('facebook_accounts_for_instagram', PROJECT_ID);
        return res.json({ message: 'Disconnected from Instagram successfully' });

      case 'facebook':
        removeTokenByProjectID('facebook_token', PROJECT_ID);
        removeTokenByProjectID('facebook_code', PROJECT_ID);
        removeTokenByProjectID('facebook_accounts', PROJECT_ID);
        return res.json({ message: 'Disconnected from Facebook successfully' });

      case 'tiktok':
        removeTokenByProjectID('tiktok_token', PROJECT_ID);
        removeTokenByProjectID('tiktok_code', PROJECT_ID);
        removeTokenByProjectID('tiktok_user_info', PROJECT_ID);
        return res.json({ message: 'Disconnected from TikTok successfully' });

      case 'x':
        removeTokenByProjectID('x_token', PROJECT_ID);
        removeTokenByProjectID('x_oauth_state', PROJECT_ID);
        removeTokenByProjectID('x_user_info', PROJECT_ID);
        return res.json({ message: 'Disconnected from X successfully' });

      case 'reddit':
        removeTokenByProjectID('reddit_token', PROJECT_ID);
        removeTokenByProjectID('reddit_oauth_state', PROJECT_ID);
        removeTokenByProjectID('reddit_user_info', PROJECT_ID);
        return res.json({ message: 'Disconnected from Reddit successfully' });

      default:
        return res.status(400).json({ error: 'Unsupported platform' });
    }
  } catch (error) {
    console.error('Error connecting to platform:', error);
    res.status(500).json({ error: 'Error connecting to platform' });
  }
});

// ============================================
// OAUTH CALLBACKS
// ============================================

router.get('/oauth2callback/youtube', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    let PROJECT_ID = 2;
    if (state) {
      try {
        const stateData = await retrieveOAuthState(state);
        PROJECT_ID = stateData.project_id;
      } catch (err) {
        console.warn('Could not retrieve state for YouTube, using default PROJECT_ID=2');
      }
    }

    await storeTokenByProjectID('youtube_code', { code: code }, PROJECT_ID);
    await youTubeManager.getTokenFromCode(code, PROJECT_ID);

    try {
      const youtubeToken = await retrieveTokenByProjectID('youtube_token', PROJECT_ID);
      if (youtubeToken && youtubeToken.access_token) {
        const auth = new google.auth.OAuth2(
          process.env.YOUTUBE_CLIENT_ID,
          process.env.YOUTUBE_CLIENT_SECRET,
          process.env.YOUTUBE_REDIRECT_URI
        );
        auth.setCredentials(youtubeToken);
        const youtube = google.youtube({ version: 'v3', auth });
        const channelResponse = await youtube.channels.list({
          part: 'snippet',
          mine: true
        });
        if (channelResponse.data.items && channelResponse.data.items.length > 0) {
          const channelInfo = {
            channelId: channelResponse.data.items[0].id,
            channelTitle: channelResponse.data.items[0].snippet.title
          };
          await storeTokenByProjectID('youtube_channel_info', channelInfo, PROJECT_ID);
        }
      }
    } catch (err) {
      console.error('Error fetching YouTube channel info:', err);
    }

    res.redirect(`${baseDomain}/accounts`);
  } catch (error) {
    console.error('Error during YouTube OAuth2 callback:', error);
    res.status(500).send('Error during YouTube authorization');
  }
});

router.get('/oauth2callback/tiktok', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('TikTok OAuth error:', error, error_description);
    return res.redirect(`${baseDomain}/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    await tiktokManager.exchangeCodeForToken(code, state);

    try {
      const stateData = await retrieveOAuthState(state);
      const PROJECT_ID = stateData.project_id;

      await new Promise(resolve => setTimeout(resolve, 500));

      const tiktokToken = await retrieveTokenByProjectID('tiktok_token', PROJECT_ID);
      console.log('🔍 TikTok token retrieved:', tiktokToken ? 'exists' : 'null', tiktokToken?.access_token ? 'has access_token' : 'no access_token');

      if (tiktokToken && tiktokToken.access_token) {
        const userInfoResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username', {
          headers: {
            'Authorization': `Bearer ${tiktokToken.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        const responseText = await userInfoResponse.text();

        if (userInfoResponse.ok) {
          const userInfo = JSON.parse(responseText);
          if (userInfo.data && userInfo.data.user) {
            await storeTokenByProjectID('tiktok_user_info', userInfo.data.user, PROJECT_ID);
            console.log('✅ TikTok user info stored:', userInfo.data.user);
          } else {
            console.error('❌ Unexpected TikTok API response structure:', userInfo);
          }
        } else {
          console.error('❌ TikTok API error:', responseText);
        }
      } else {
        console.error('❌ TikTok token not found or missing access_token');
      }
    } catch (err) {
      console.error('Error fetching TikTok user info:', err);
    }

    res.redirect(`${baseDomain}/accounts?tiktok=connected`);
  } catch (error) {
    console.error('Error during TikTok OAuth2 callback:', error);
    res.redirect(`${baseDomain}/accounts?error=tiktok_auth_failed`);
  }
});

router.get('/oauth2callback/instagram', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('Instagram OAuth error:', error, error_description);
    return res.redirect(`${baseDomain}/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  if (!state) {
    return res.status(400).send('State parameter is missing');
  }

  try {
    const stateData = await retrieveOAuthState(state);
    const PROJECT_ID = stateData.project_id;

    await storeTokenByProjectID('instagram_code', { code: code }, PROJECT_ID);
    axios.get(instagramManager.getTokenExchangeUrl(code)).then(async (response) => {
      await storeTokenByProjectID('instagram_token', response.data, PROJECT_ID);

      axios.get(`https://graph.facebook.com/v24.0/me/accounts?access_token=${response.data.access_token}`)
        .then(async (response) => {
          await storeTokenByProjectID('facebook_accounts_for_instagram', response.data, PROJECT_ID);

          const pageAccessToken = response.data.data[0].access_token;
          axios.get(`https://graph.facebook.com/v24.0/${response.data.data[0].id}?fields=instagram_business_account&access_token=${pageAccessToken}`)
            .then(async (igResponse) => {
              const igAccountId = igResponse.data.instagram_business_account.id;
              axios.get(`https://graph.facebook.com/v24.0/${igAccountId}?fields=id,username,name&access_token=${pageAccessToken}`)
                .then(async (igAccountResponse) => {
                  await storeTokenByProjectID('instagram_business_account', igAccountResponse.data, PROJECT_ID);
                });
            });
        });
    });

    res.redirect(`${baseDomain}/accounts?instagram=connected`);
  } catch (error) {
    console.error('Error during Instagram OAuth2 callback:', error);
    res.redirect(`${baseDomain}/accounts?error=instagram_auth_failed`);
  }
});

router.get('/oauth2callback/facebook', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('Facebook OAuth error:', error, error_description);
    return res.redirect(`${baseDomain}/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  if (!state) {
    return res.status(400).send('State parameter is missing');
  }

  try {
    const stateData = await retrieveOAuthState(state);
    const PROJECT_ID = stateData.project_id;

    await storeTokenByProjectID('facebook_code', { code: code }, PROJECT_ID);
    axios.get(facebookManager.getTokenExchangeUrl(code)).then(async (response) => {
      await storeTokenByProjectID('facebook_token', response.data, PROJECT_ID);

      axios.get(`https://graph.facebook.com/v24.0/me/accounts?access_token=${response.data.access_token}`)
        .then(async (response) => {
          await storeTokenByProjectID('facebook_accounts', response.data, PROJECT_ID);
        });
    });

    res.redirect(`${baseDomain}/accounts?facebook=connected`);
  } catch (error) {
    console.error('Error during Facebook OAuth2 callback:', error);
    res.redirect(`${baseDomain}/accounts?error=facebook_auth_failed`);
  }
});

router.get('/oauth2callback/x', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('X OAuth error:', error, error_description);
    return res.redirect(`${baseDomain}/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    await xManager.exchangeCodeForToken(code, state);

    try {
      const stateData = await retrieveOAuthState(state);
      const PROJECT_ID = stateData.project_id;
      const xToken = await retrieveTokenByProjectID('x_token', PROJECT_ID);
      if (xToken && xToken.access_token) {
        const userResponse = await fetch('https://api.twitter.com/2/users/me', {
          headers: {
            'Authorization': `Bearer ${xToken.access_token}`
          }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.data) {
            await storeTokenByProjectID('x_user_info', userData.data, PROJECT_ID);
            console.log('✅ X user info stored:', userData.data);
          }
        } else {
          console.error('❌ X API error:', await userResponse.text());
        }
      }
    } catch (err) {
      console.error('Error fetching X user info:', err);
    }

    console.log('X token stored successfully');
    res.redirect(`${baseDomain}/accounts?x=connected`);
  } catch (error) {
    console.error('Error during X OAuth2 callback:', error);
    res.redirect(`${baseDomain}/accounts?error=x_auth_failed`);
  }
});

router.get('/oauth2callback/reddit', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error && process.env.NODE_ENV == 'prod') {
    console.error('Reddit OAuth error:', error, error_description);
    return res.redirect(`${baseDomain}/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    const tokenData = await redditManager.exchangeCodeForToken(code, state);

    if (tokenData.redirect === 'to_local') {
      res.redirect('http://localhost:6709/api/oauth2callback/reddit?code=' + code + '&state=' + state + '&error=' + (error || '') + '&error_description=' + (error_description || ''));
    }
    try {
      const stateData = await retrieveOAuthState(state);
      const PROJECT_ID = stateData.project_id;
      const redditToken = await retrieveTokenByProjectID('reddit_token', PROJECT_ID);
      if (redditToken && redditToken.access_token) {
        const userResponse = await fetch('https://oauth.reddit.com/api/v1/me', {
          headers: {
            'Authorization': `Bearer ${redditToken.access_token}`,
            'User-Agent': 'ControlStudio/1.0'
          }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          await storeTokenByProjectID('reddit_user_info', userData, PROJECT_ID);
          console.log('✅ Reddit user info stored:', userData);
        } else {
          console.error('❌ Reddit API error:', await userResponse.text());
        }
      }
    } catch (err) {
      console.error('Error fetching Reddit user info:', err);
    }

    console.log('Reddit token stored successfully');
    res.redirect(`${baseDomain}/accounts?reddit=connected`);
  } catch (error) {
    console.error('Error during Reddit OAuth2 callback:', error);
    res.redirect(`${baseDomain}/accounts?error=reddit_auth_failed`);
  }
});

export default router;
