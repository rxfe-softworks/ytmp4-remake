const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

class YouTubeDownloader {
  constructor() {
    this.defaultOptions = {
      quality: 'best',
      format: 'mp3',
      outputDir: '../downloads',
      filename: null
    };
  }

  /**
   * Download YouTube video/audio
   * @param {string} url - YouTube video URL
   * @param {object} options - Download options
   * @param {string} options.quality - 'best', 'high', 'medium', 'low', 'audio'
   * @param {string} options.format - 'mp4' or 'mp3'
   * @param {string} options.outputDir - Output directory path
   * @param {string} options.filename - Custom filename (optional)
   * @returns {Promise<object>} - Download result with file path and info
   */
  async download(url, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    if (!ytdl.validateURL(url)) {
      throw new Error('Invalid YouTube URL');
    }
    if (!fs.existsSync(opts.outputDir)) {
      fs.mkdirSync(opts.outputDir, { recursive: true });
    }

    const info = await ytdl.getInfo(url);
    const title = this.sanitizeFilename(info.videoDetails.title);
    const filename = opts.filename || title;
    const extension = opts.format === 'mp3' ? 'mp3' : 'mp4';
    const outputPath = path.join(opts.outputDir, `${filename}.${extension}`);

    if (opts.format === 'mp3') {
      return await this.downloadAudio(url, outputPath, opts.quality, info);
    } else {
      return await this.downloadVideo(url, outputPath, opts.quality, info);
    }
  }

  async downloadVideo(url, outputPath, quality, info) {
    return new Promise((resolve, reject) => {
      const videoQuality = this.getVideoQuality(quality);
      
      const videoStream = ytdl(url, {
        quality: videoQuality,
        filter: quality === 'audio' ? 'audioonly' : 'videoandaudio'
      });

      const writeStream = fs.createWriteStream(outputPath);
      let downloadedBytes = 0;

      videoStream.on('progress', (chunkLength, downloaded, total) => {
        downloadedBytes = downloaded;
        const percent = ((downloaded / total) * 100).toFixed(2);
        console.log(`Downloading: ${percent}% (${this.formatBytes(downloaded)}/${this.formatBytes(total)})`);
      });

      videoStream.pipe(writeStream);

      writeStream.on('finish', () => {
        resolve({
          success: true,
          path: outputPath,
          size: downloadedBytes,
          title: info.videoDetails.title,
          duration: info.videoDetails.lengthSeconds
        });
      });

      writeStream.on('error', reject);
      videoStream.on('error', reject);
    });
  }

  async downloadAudio(url, outputPath, quality, info) {
    return new Promise((resolve, reject) => {
      const audioQuality = this.getAudioQuality(quality);
      const tempPath = outputPath.replace('.mp3', '.temp.mp4');

      const audioStream = ytdl(url, {
        quality: audioQuality,
        filter: 'audioonly'
      });

      const writeStream = fs.createWriteStream(tempPath);

      audioStream.on('progress', (chunkLength, downloaded, total) => {
        const percent = ((downloaded / total) * 100).toFixed(2);
        console.log(`Downloading audio: ${percent}%`);
      });

      audioStream.pipe(writeStream);
      writeStream.on('finish', () => {
        console.log('Converting to MP3...');
        
        ffmpeg(tempPath)
          .audioBitrate(this.getAudioBitrate(quality))
          .format('mp3')
          .on('progress', (progress) => {
            console.log(`Converting: ${progress.percent?.toFixed(2) || 0}%`);
          })
          .on('end', () => {
            fs.unlinkSync(tempPath);
            const stats = fs.statSync(outputPath);
            resolve({
              success: true,
              path: outputPath,
              size: stats.size,
              title: info.videoDetails.title,
              duration: info.videoDetails.lengthSeconds
            });
          })
          .on('error', (err) => {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            reject(err);
          })
          .save(outputPath);
      });

      writeStream.on('error', reject);
      audioStream.on('error', reject);
    });
  }

  /**
   * Get video quality setting
   */
  getVideoQuality(quality) {
    const qualityMap = {
      best: 'highestvideo',
      high: 'highestvideo',
      medium: 'medium',
      low: 'lowest',
      audio: 'highestaudio'
    };
    return qualityMap[quality] || 'highestvideo';
  }

  /**
   * Get audio quality setting
   */
  getAudioQuality(quality) {
    const qualityMap = {
      best: 'highestaudio',
      high: 'highestaudio',
      medium: 'lowestaudio',
      low: 'lowestaudio',
      audio: 'highestaudio'
    };
    return qualityMap[quality] || 'highestaudio';
  }

  /**
   * Get audio bitrate for MP3 conversion
   */
  getAudioBitrate(quality) {
    const bitrateMap = {
      best: 320,
      high: 256,
      medium: 192,
      low: 128
    };
    return bitrateMap[quality] || 192;
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename.replace(/[/\\?%*:|"<>]/g, '-').substring(0, 200);
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  async getInfo(url) {
    if (!ytdl.validateURL(url)) {
      throw new Error('Invalid YouTube URL');
    }
    const info = await ytdl.getInfo(url);
    return {
      title: info.videoDetails.title,
      duration: info.videoDetails.lengthSeconds,
      author: info.videoDetails.author.name,
      views: info.videoDetails.viewCount,
      thumbnail: info.videoDetails.thumbnails[0].url,
      description: info.videoDetails.description
    };
  }
}

module.exports = YouTubeDownloader;