# 🧠 How To Run The Project

Follow these steps EXACTLY.

## 1. Clone the Project

```bash
git clone <repo-url>
```

Then open the folder in VS Code.

## 2. Install All Project Dependencies

In the **project folder**:

```bash
npm install
```

This installs Expo, React Native, etc.

## 3. Install Extra Tools for Desktop Development

We use Electron only for the desktop app.

Run:

```bash
npm install --save-dev electron concurrently wait-on
```

## 4. Start Expo

```bash
npm start
```

Expo will show a QR code.
You can run it on:

- your phone via Expo Go
- web (follow the localhost link)
- Android emulator (If you hate yourself)
- iOS simulator (Mac only)

## 5. Start the Desktop App (Electron)

In a different terminal (expo web must be running already)

```bash
npm run electron
```

## 6. Start Expo Web + Electron Together

Run:

```bash
npm run dev
```

What this does:

1. Starts the Expo Web server.
2. Waits until the server is ready.

   - ⚠ Sometimes the server takes a few seconds to fully start.
   - If Electron opens a white screen, **open the web link printed in the terminal (e.g., [http://localhost:8081](http://localhost:8081)) in your browser first**. Once it loads there, Electron should display it correctly.

3. Launches Electron.
4. Electron loads the web version inside a desktop window.

# 🚨 Notes

### 1. Everyone must install Electron, concurrently and wait-on

Otherwise desktop won’t run.

### 2. You **do not** need Android Studio or Xcode unless you want mobile emulators.

Using Expo Go on your phone is enough.

### 3. We focus on mobile development, some things may need additional libraries or strategies for web/desktop.

But that's fine, we good.

---

![Goose](assets/goose.jpg)
