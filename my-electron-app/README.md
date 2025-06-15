# 🏥 Care Companion - The App That Watches You Blink (But Not in a Creepy Way)

> **Warning**: This app will count your blinks, but it's for your own good! Promise! 👀

## 🎯 What the Heck is This?

Care Companion is an Electron-based desktop application that combines the power of AI face detection with the excitement of... counting blinks! It's like having a very attentive friend who's really good at noticing when you close your eyes. 

### 🤔 Why Would Anyone Need This?

- **Medical Monitoring**: For patients who need to track their blink patterns (yes, that's a real thing!)
- **Emergency Detection**: Detects when you're blinking suspiciously fast and might need help
- **Family Peace of Mind**: Automatically calls your loved ones when you're in distress
- **Because Why Not**: Sometimes you just need an app that's really good at watching you

## 🚀 Features That Will Blow Your Mind

### 👁️ Blink Detection (The Main Event)
- **Real-time blink counting** with MediaPipe Face Mesh
- **Smart validation** - only counts "real" blinks (not just squinting at the sun)
- **Emergency trigger** - if you blink 5+ times in 3 seconds, it assumes you're in trouble
- **Visual feedback** - shows you exactly what it's seeing (green dots on your face!)

### 🚨 Emergency System
- **Automatic family calls** using Bland AI (because robots are better at making calls)
- **Fallback to system dialer** if the AI gets stage fright
- **Emergency contact management** - add all your nosy relatives

### 👤 Patient Management
- **Patient details** - store your info, photo, and medical records
- **File uploads** - because paperwork is fun when it's digital
- **Local storage** - your data stays on your computer (we're not that nosy)

### 🎨 Beautiful UI
- **Loading screen** that makes you feel like you're in a sci-fi movie
- **Responsive design** - works on screens big and small
- **Custom menu bar** - because we're fancy like that
- **Smooth animations** - but not the dizzy kind (we learned our lesson)

## 🛠️ Installation (The Boring Part)

### Prerequisites
- Node.js (version that's not too old, not too new, just right)
- npm (comes with Node.js, like a happy meal toy)
- A webcam (for the blink detection magic)
- A sense of humor (optional but recommended)

### Setup Steps

1. **Clone this bad boy**
   ```bash
   git clone https://github.com/Sai3Karthi/rheumatoid_saver.git
   cd my-electron-app
   ```

2. **Install the dependencies** (this might take a while, go get coffee)
   ```bash
   npm install
   ```

3. **Set up your environment** (create a `.env` file)
   ```bash
   # Copy the example and fill in your Bland AI API key
   cp env.example .env
   # Edit .env and add your BLAND_AI_API_KEY
   ```

4. **Build the app** (this is where the magic happens)
   ```bash
   npm run build
   ```

5. **Launch the beast**
   ```bash
   npm start
   ```

## 🎮 How to Use (The Fun Part)

### Getting Started
1. **Open the app** - you'll see a beautiful loading screen that makes you feel important
2. **Add your details** - click "Patient Details" and fill in your info (or make stuff up)
3. **Add emergency contacts** - add your family members who won't mind being called at 3 AM
4. **Start blink detection** - click "Blink Detection" and let the AI stare at you

### The Blink Detection Experience
- **Sit in front of your camera** - try to look natural (it's harder than it sounds)
- **Blink normally** - the app will count your blinks like a very attentive friend
- **Watch the magic** - see your EAR (Eye Aspect Ratio) in real-time
- **Don't panic** - if you blink too fast, it might call your mom

### Emergency Features
- **Manual emergency call** - click the big red button if you need help
- **Automatic detection** - the app will call your contacts if you blink suspiciously
- **Family notifications** - your loved ones get a nice AI voice explaining the situation

## 🔧 Configuration (For the Nerds)

### Environment Variables
```bash
BLAND_AI_API_KEY=your_bland_ai_api_key_here
```

### Blink Detection Settings
- **EAR Threshold**: 0.22 (adjust if you have very big or small eyes)
- **Min Blink Duration**: 50ms (too short = ignored)
- **Max Blink Duration**: 500ms (too long = ignored)
- **Emergency Trigger**: 5 blinks in 3 seconds

## 🐛 Known Issues (We're Working on It)

- **Face detection can be finicky** - sometimes it loses your face (don't take it personally)
- **Lighting matters** - the app works better in good lighting (like a good selfie)
- **Multiple faces confuse it** - it's designed for one person at a time
- **Very fast movements** - might miss some blinks if you're moving around a lot

## 🤝 Contributing (Join the Fun)

Want to make this app even better? Here's how:

1. **Fork the repository** - make it your own
2. **Create a feature branch** - `git checkout -b feature/amazing-feature`
3. **Make your changes** - add some magic
4. **Test everything** - make sure you didn't break the blink detection
5. **Submit a pull request** - we'll review it and probably merge it

## 📝 Version History

### v2.1 (Current) - "The Blink That Counts"
- ✅ Fixed confusing count decreases
- ✅ Added pending blink validation
- ✅ Improved face detection stability
- ✅ Cleaned up funny rotating animations
- ✅ Better user feedback

### v2.0 - "The Great UI Overhaul"
- ✅ Side-by-side layout
- ✅ Custom menu bar
- ✅ Loading screen
- ✅ Responsive design

### v1.0 - "The Beginning"
- ✅ Basic blink detection
- ✅ Emergency calling
- ✅ Patient management

## 🎭 The Team

- **Lead Developer**: Someone who really likes counting blinks
- **UI Designer**: Someone who really likes gradients
- **AI Integration**: Someone who really likes robots
- **Testing**: Someone who really likes blinking

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MediaPipe** - for making face detection possible
- **Bland AI** - for the robot voice calls
- **Electron** - for making desktop apps fun
- **React** - for making UI development less painful
- **Coffee** - for keeping us awake during development

## 🆘 Support

Having issues? Here are your options:

1. **Check the console** - there are probably helpful error messages
2. **Restart the app** - the classic IT solution
3. **Check your camera** - make sure it's not covered by a sticky note
4. **Contact us** - but only if you're really desperate

---

**Remember**: This app is designed to help, not to creep you out. If you feel like it's watching you too closely, that's probably because it is. But it's for your own good! 😊

*Made with ❤️ and a lot of blinking* 