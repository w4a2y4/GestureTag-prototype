# Repository Structure
```
GestureTag-prototype
|-- TouchPad (Mac Trackpad App -- client)
|server.js (server)
```
## Node Server
```
TODO...
```

## TouchPad (Xcode Project with CocoaPods)
Make sure you've installed CocoaPods and Xcode.

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

# Instructions
Please follow the order, so the connection of server and client can be established.
```
npm install
npm start
Open and Run TouchPad in Xcode
```
