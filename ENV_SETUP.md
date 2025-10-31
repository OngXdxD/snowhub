# Environment Variables Setup

## Quick Setup

Create a `.env` file in the root directory of your project:

```bash
# .env
VITE_API_URL=http://localhost:3000
```

> **Note**: `.env` files should be added to `.gitignore` to keep sensitive data secure.

## Configuration Options

### Development
```env
VITE_API_URL=http://localhost:3000
```

### Production
```env
VITE_API_URL=https://your-api-domain.com
```

### Staging
```env
VITE_API_URL=https://staging-api.your-domain.com
```

## Using Environment Variables

The API service automatically reads from `VITE_API_URL`:

```javascript
// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

## Important Notes

1. **Prefix with `VITE_`**: Vite only exposes environment variables that start with `VITE_`
2. **Restart dev server**: After changing `.env`, restart `yarn dev`
3. **Don't commit**: Add `.env` to `.gitignore` (`.env.example` is OK to commit)

## Creating .env File

### Windows (PowerShell)
```powershell
New-Item .env -ItemType File
Set-Content .env "VITE_API_URL=http://localhost:3000"
```

### macOS/Linux
```bash
echo "VITE_API_URL=http://localhost:3000" > .env
```

### Manually
Just create a file named `.env` in the project root with the content above.

## Verifying Setup

After creating `.env` and restarting the dev server, the API calls will automatically use your configured URL. Check the browser console Network tab to verify requests are going to the correct endpoint.

