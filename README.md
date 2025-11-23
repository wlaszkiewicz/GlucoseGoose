# 🧠 How To Run The Project

## 0. Clone the Project

```bash
git clone https://github.com/wlaszkiewicz/GlucoseGoose.git
```

Then open the folder in VS Code.

## 1. Create .env

Create a .env in the project root!!

> ⚠ Do not commit .env to git. Each developer needs their own copy. !!!!!!! DO NOT COMMIT IT

## 2. Install All Project Dependencies

In the **project folder**:

```bash
npm install
```

This installs Expo, React Native, etc.

## 3. Start Expo

```bash
npm start
```

Expo will show a QR code.
You can run it on:

- your phone via Expo Go
- web (follow the localhost link)
- Android emulator (If you hate yourself)
- iOS simulator (Mac only)

## 4. Start the Desktop App (Electron)

In a different terminal (expo web must be running already)

```bash
npm run electron
```

## 5. Start Expo Web + Electron Together

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

---

![Goose](assets/goose.jpg)
