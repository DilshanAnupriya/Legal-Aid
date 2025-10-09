# Text-to-Speech (TTS) Setup Guide

## 📦 Installation

### Step 1: Install the expo-speech package

```bash
npx expo install expo-speech
```

### Step 2: Platform-specific setup

#### For Expo Managed Workflow
No additional setup required! expo-speech works out of the box with Expo.

#### For Expo Development Build or Bare Workflow
If using development builds or bare workflow, the package will be automatically linked.

### Step 3: Permissions
No additional permissions required - expo-speech uses the device's built-in TTS capabilities.

## 🌐 Language Support

### Supported Languages
- **English (en-US)**: Available on all devices
- **Tamil (ta-IN)**: May require Tamil language pack
- **Sinhala (si-LK)**: Android only, requires Sinhala TTS engine

### Installing Language Support

#### Android
1. Go to **Settings > Language & input > Text-to-speech output**
2. Select **Google Text-to-speech Engine**
3. Tap **Settings > Install voice data**
4. Download required language packs (Tamil, Sinhala)

#### iOS
1. Go to **Settings > Accessibility > Spoken Content**
2. Tap **Voices**
3. Download required language voices

## 🔧 Features Implemented

### Core Features ✅
- [x] Multi-language support (English, Tamil, Sinhala)
- [x] Offline TTS using device's built-in engine
- [x] Speech rate and pitch control
- [x] Stop current speech functionality
- [x] Error handling for unavailable languages
- [x] Clean UI with text input and controls

### Advanced Features ✅
- [x] Available voices detection and logging
- [x] Language availability checking
- [x] Sinhala-specific error warnings
- [x] Sample text for each language
- [x] Real-time speech status
- [x] Debug information in development mode

### Bonus Features ✅
- [x] Rate and pitch sliders with visual feedback
- [x] Character counter for text input
- [x] Status indicators for TTS readiness
- [x] Responsive design for different screen sizes

## 🎮 Usage

### Basic Usage
```typescript
import TextToSpeech from './components/ui/TextToSpeech';

// In your component
<TextToSpeech
    initialText="Hello, world!"
    showAdvancedControls={true}
    onSpeakStart={() => console.log('Speaking started')}
    onSpeakEnd={() => console.log('Speaking ended')}
/>
```

### Using the TTS Hook
```typescript
import useTTS from './hooks/useTTS';

const MyComponent = () => {
    const { speak, isSpeaking, stopSpeaking, availableVoices } = useTTS();
    
    const handleSpeak = () => {
        speak("Hello, world!", "en-US");
    };
    
    return (
        <TouchableOpacity onPress={handleSpeak}>
            <Text>{isSpeaking ? 'Stop' : 'Speak'}</Text>
        </TouchableOpacity>
    );
};
```

## 🔍 Debugging

### Voice Detection
The app automatically logs available voices on startup:
```
🔊 Initializing TTS...
📋 Available voices: [array of voice objects]
✅ TTS initialized successfully
```

### Common Issues

#### Sinhala Not Working
- **Problem**: Sinhala voice not available
- **Solution**: Install Google TTS or other TTS engine that supports Sinhala
- **Check**: Go to device TTS settings and verify Sinhala is available

#### No Sound Output
- **Problem**: TTS not producing sound
- **Solution**: Check device volume, TTS settings, and permissions
- **Debug**: Look for error messages in console

#### Rate/Pitch Not Working
- **Problem**: Speech rate/pitch changes not applied
- **Solution**: Some TTS engines have limitations on rate/pitch ranges
- **Workaround**: Use default values or check engine documentation

## 📱 Platform Differences

### Android
- Better language support (including Sinhala)
- More TTS engines available
- Better rate and pitch control

### iOS
- Limited language support for some regional languages
- Consistent voice quality
- May not support Sinhala TTS

## 🚀 Performance Tips

1. **Initialize TTS early**: The hook automatically initializes on mount
2. **Cache voice list**: Available voices are cached after first load
3. **Limit text length**: Keep text under 1000 characters for best performance
4. **Handle interruptions**: Always stop previous speech before starting new

## 🛠 Customization

### Adding New Languages
1. Add language config to `supportedLanguages` in `useTTS.js`
2. Add sample text in `TextToSpeech.tsx`
3. Update language selector UI

### Styling
All styles are theme-aware and follow the app's design system. Customize styles in `TextToSpeech.tsx` by modifying the `createStyles` function.

## 🔗 Integration

The TTS feature is integrated into the Forums page with:
- **Access**: TTS button in the header (🔊 icon)
- **Modal**: Full-screen TTS interface
- **Theming**: Follows app's dark/light theme
- **Navigation**: Smooth modal transitions

## 📋 Testing Checklist

- [ ] Expo Speech initialization works on app startup
- [ ] English voices are available and working
- [ ] Tamil voices work (if language pack installed)
- [ ] Sinhala voices work (Android with language pack)
- [ ] Rate and pitch controls function properly
- [ ] Error messages display for unavailable languages
- [ ] Modal opens/closes smoothly
- [ ] Text input and character counter work
- [ ] Sample text button functions
- [ ] Stop functionality works during speech
- [ ] Theme switching doesn't break UI
- [ ] Works on both portrait and landscape orientations
- [ ] Works in Expo Go app (for testing)
- [ ] Voice callbacks function properly

## 🆘 Support

For issues with Expo Speech functionality:
1. Check device TTS settings
2. Verify language pack installation
3. Review console logs for error messages
4. Test with different text lengths and languages
5. Ensure Expo SDK compatibility
6. Test in Expo Go app first, then in development build

## 🔧 Expo-specific Notes

- **Expo Go**: Full TTS functionality works in Expo Go
- **Development Build**: All features supported
- **Production**: Works in both store builds and web
- **Web Platform**: Uses browser's Speech Synthesis API
- **Offline**: Works completely offline on native platforms

---

**Note**: This implementation uses Expo Speech which is designed specifically for Expo applications and works seamlessly across all Expo deployment targets.
