# Repository Structure
```
GestureTag-prototype
|-- TouchPad (Mac Trackpad App -- client)
|server.js (server)
|trackpad.html (Mobile Trackpad --  client)
```

# Instructions
Basically, start the server first and then enable one of trackpad client platform (Mac App or Webpage)
```
// start the node http server
npm install
npm start

// If you are using macOS, then you can open the Mac App.
// Please follow the instruction in section ## TouchPad ## to install all dependencies before running it.  
Open and Run TouchPad in Xcode

// If you are using Windows, please find a mobile phone or tablet.
1. Find the local IP address of your laptop
2. Open the web browser on the mobile device.
3. Type [ip adrress]/trackpad.html in the address bar.
(you should see the page with purple background and 'a user connected' on the console of the server)
```
[How to find your ip address on Windows](https://www.digitalcitizen.life/find-ip-address-windows)
## TouchPad (Xcode Project with CocoaPods)
Make sure you have Apple Developer Account (it is free) and have installed CocoaPods and Xcode.

### Install CocoaPods
If you don't have Homebrew:
`sudo gem install cocoapods`

If you have it, then try to use Homebrew to install:
``brew install cocoapods``

### Install Dependencies
```
cd TouchPad
pod install
```

### Open TouchPad Project
```
open `TrackPad.xcworkspace` with Xcode or double click the file in your Finder.
```
