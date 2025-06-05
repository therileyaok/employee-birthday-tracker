# Employee Birthday Tracker

A web application for tracking employee birthdays.

## Features

- View upcoming birthdays
- Upload employee birthdays via Excel file
- Persistent storage of employee data
- Modern, responsive UI

## Deployment Instructions

1. Create a new repository on GitHub
2. Initialize git in your project directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. Add your GitHub repository as remote:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git branch -M main
   git push -u origin main
   ```

4. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

5. Update the homepage URL in package.json with your GitHub username:
   ```json
   "homepage": "https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/"
   ```

## Local Development

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
```
