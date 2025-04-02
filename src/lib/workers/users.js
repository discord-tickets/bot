const { expose } = require('threads/worker');
const fs = require('fs').promises;
const path = require('path');

expose({
	async saveAvatar(avatar) {
		const avatarDir = path.join('user', 'avatars');

		const ext = path.extname(avatar.url);
		const filename = `${avatar.hash}${ext}`;
		const filePath = path.join(avatarDir, filename);

		try {
			await fs.access(filePath);
			return filename; // Avatar already saved
		  } catch (err) {
			if (err.code !== 'ENOENT') {
			  return false;
			}
		  }

		const res = await fetch(avatar.url);
		if (!res.ok) {
		  return false;
		}

		const arrayBuffer = await res.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		try {
			await fs.writeFile(filePath, buffer);
		} catch {
			return false;
		}

		return filename;
	},
});
