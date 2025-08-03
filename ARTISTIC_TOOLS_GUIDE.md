# 🎨 PromptStruct Artistic Tools - Complete Guide

## 🌟 **Overview**

PromptStruct now includes specialized artistic tools for creative AI platforms! The extension automatically detects when you're on creative AI websites and provides enhanced prompting capabilities for:

- **🖼️ Text-to-Image** (Midjourney, Adobe Firefly, Leonardo AI, etc.)
- **🎬 Text-to-Video** (Runway, Synthesia, Pika Labs, Luma AI, etc.)
- **🎵 Text-to-Audio/Music** (Suno AI, ElevenLabs, Mubert, etc.)
- **🗣️ Text-to-Speech** (ElevenLabs, specialized voice generation)
- **✍️ Creative Writing** (Jasper, Copy.ai, Notion AI, etc.)
- **🎨 Artistic Design** (General creative design tools)

## 🎯 **Supported Platforms**

### **🖼️ Image Generation**
- **Midjourney** - `midjourney.com`
- **Adobe Firefly** - `firefly.adobe.com`
- **Leonardo AI** - `app.leonardo.ai/image-generation`, `app.leonardo.ai/ai-canvas`
- **Playground AI** - `playground.ai`
- **Ideogram** - `ideogram.ai`
- **Artbreeder** - `artbreeder.com`
- **Flux AI** - `flux1.ai`

### **🎬 Video Generation**
- **Runway** - `runwayml.com`, `app.runwayml.com`
- **Synthesia** - `synthesia.io`
- **Google Veo** - `deepmind.google`, `veo.google`
- **Kling AI** - `kuaishou.com`, `kling.kuaishou.com`
- **Pika Labs** - `pika.art`
- **Luma AI** - `luma.ai`, `lumalabs.ai`
- **Haiper** - `haiper.ai`
- **Elai.io** - `elai.io`
- **Vmaker AI** - `vmaker.com`
- **Hypernatural** - `hypernatural.ai`

### **🎵 Audio & Music Generation**
- **Suno AI** - `suno.com`, `app.suno.ai`
- **ElevenLabs** - `elevenlabs.io`, `beta.elevenlabs.io`
- **Mubert** - `mubert.com`
- **Soundraw** - `soundraw.io`
- **Beatoven.ai** - `beatoven.ai`
- **Boomy** - `boomy.com`
- **AIVA** - `aiva.ai`

### **✍️ Text Generation**
- **Jasper** - `jasper.ai`
- **Copy.ai** - `copy.ai`
- **Notion AI** - `notion.so`
- **Mem** - `mem.ai`

## ✨ **Key Features**

### **1. Automatic Detection**
- **Smart Site Recognition**: Automatically detects when you're on a creative AI platform
- **Category Classification**: Identifies whether you're doing image, video, audio, or text generation
- **Visual Indicators**: Shows artistic mode with colorful gradients and category badges

### **2. Specialized JSON Schemas**
Each creative category has its own optimized JSON schema:

#### **🖼️ Text-to-Image Schema**
```json
{
  "prompt": "Detailed visual description",
  "negative_prompt": "What to avoid",
  "style": "Artistic style/movement",
  "aspect_ratio": "16:9, 1:1, etc.",
  "quality": "High, ultra, masterpiece",
  "artistic_style": "Photography, painting, digital art",
  "lighting": "Golden hour, studio, dramatic",
  "composition": "Rule of thirds, close-up, wide angle",
  "color_palette": "Warm, cool, monochrome",
  "mood": "Serene, dramatic, mysterious",
  "technical_details": "8K, HDR, professional"
}
```

#### **🎬 Text-to-Video Schema**
```json
{
  "scene_description": "Detailed scene setup",
  "duration": "Length in seconds",
  "camera_movement": "Pan, zoom, tracking",
  "motion_type": "Slow motion, time-lapse",
  "style": "Cinematic, documentary",
  "quality": "4K, HD, cinema quality",
  "fps": "24, 30, 60",
  "aspect_ratio": "16:9, 9:16, 1:1",
  "transitions": "Fade, cut, dissolve",
  "audio_cues": "Background music, effects",
  "visual_effects": "Particles, color grading"
}
```

#### **🎵 Text-to-Audio Schema**
```json
{
  "description": "Audio content description",
  "genre": "Electronic, jazz, classical",
  "mood": "Upbeat, melancholic, energetic",
  "tempo": "120 BPM, slow, fast",
  "key": "C major, A minor",
  "instruments": "Piano, guitar, synthesizer",
  "vocals": "Male, female, instrumental",
  "duration": "30 seconds, 2 minutes",
  "style": "Lo-fi, studio quality",
  "production_quality": "Professional, demo",
  "audio_effects": "Reverb, delay, compression"
}
```

### **3. Enhanced Prompt Enhancement**
When you click **🚀 Enhance Prompt** on artistic sites, the AI provides:

#### **For Image Generation:**
- **Visual Details**: Specific subject descriptions, lighting, composition
- **Artistic Style**: Art movements, techniques, artist references
- **Technical Parameters**: Camera settings, resolution, quality modifiers
- **Color & Mood**: Palette descriptions, emotional atmosphere
- **Professional Terms**: Industry-standard photography/art terminology

#### **For Video Generation:**
- **Scene Descriptions**: Detailed visual elements and settings
- **Motion & Camera Work**: Specific movements, shots, transitions
- **Cinematic Style**: Film genres, director styles, cinematography
- **Technical Specs**: Duration, frame rate, aspect ratio
- **Audio Elements**: Music cues, sound effects, dialogue

#### **For Audio Generation:**
- **Musical Elements**: Genre, tempo, key, instrumentation
- **Production Style**: Recording quality, mixing, effects
- **Mood & Atmosphere**: Emotional tone, energy level
- **Structure**: Song sections, arrangement, dynamics

## 🚀 **How to Use**

### **Step 1: Visit a Creative AI Platform**
Navigate to any supported artistic AI website (Midjourney, Runway, Suno AI, etc.)

### **Step 2: Automatic Detection**
- The extension automatically detects the platform type
- You'll see an artistic mode indicator in the popup
- The sphere interface gets a colorful gradient based on the category

### **Step 3: Choose Your Schema**
- Open the PromptStruct popup or sphere interface
- The appropriate artistic schema is auto-selected
- You can manually choose from the **🎨 Creative & Artistic** section

### **Step 4: Enter Your Prompt**
Type your creative prompt in natural language:
- "A serene mountain landscape at sunset"
- "Create an upbeat electronic music track"
- "Generate a cinematic video of a city at night"

### **Step 5: Convert to JSON**
Click **✨ Convert to JSON** to get a structured format optimized for your creative platform

### **Step 6: Enhance (Optional)**
Click **🚀 Enhance Prompt** for AI-powered improvements with:
- Professional creative terminology
- Technical parameters and specifications
- Artistic style recommendations
- Industry best practices

## 🎨 **Visual Indicators**

### **Artistic Mode Badges**
- **🖼️ IMAGE MODE**: Blue-teal gradient for image generation
- **🎬 VIDEO MODE**: Purple-pink gradient for video creation
- **🎵 AUDIO MODE**: Orange-pink gradient for music/audio
- **✍️ TEXT MODE**: Teal-pink gradient for creative writing

### **Enhanced Sphere Interface**
- **Dynamic Gradients**: Sphere changes color based on creative category
- **Category Tooltips**: Hover to see platform and mode information
- **Artistic Animations**: Enhanced visual effects for creative platforms

## 💡 **Pro Tips**

### **For Better Image Generation:**
- Include lighting conditions ("golden hour", "studio lighting")
- Specify art styles ("photorealistic", "oil painting", "digital art")
- Add composition rules ("rule of thirds", "close-up portrait")
- Use quality modifiers ("highly detailed", "8K resolution", "masterpiece")

### **For Better Video Generation:**
- Describe camera movements ("smooth tracking shot", "drone aerial view")
- Specify motion types ("slow motion", "time-lapse", "dynamic movement")
- Include cinematic styles ("documentary", "music video", "film noir")
- Add technical details ("4K resolution", "60fps", "color grading")

### **For Better Audio Generation:**
- Specify genres and subgenres ("ambient electronic", "jazz fusion")
- Include tempo and mood ("120 BPM upbeat", "slow melancholic ballad")
- Describe instrumentation ("acoustic guitar", "synthesizer pads")
- Add production style ("lo-fi aesthetic", "studio quality")

## 🔧 **Technical Details**

- **Auto-Detection**: Based on website hostname matching
- **Schema Selection**: Automatic based on platform category
- **Enhancement AI**: Context-aware prompting with artistic expertise
- **Visual Styling**: CSS gradients and animations for artistic modes
- **Cross-Platform**: Works on all supported creative AI websites

The artistic tools make PromptStruct the ultimate companion for creative AI workflows! 🎨✨
