//
//  ViewController.m
//  TrackPad
//
//  Created by Tony Tung on 12/8/17.
//  Copyright © 2017 gesturetag. All rights reserved.
//

#import "ViewController.h"
@import SocketIO;
@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    NSLog(@"view");
    // Do any additional setup after loading the view.
//    [self connectWebSocket];
//    [self initSocketIOConnection];
}


- (void)setRepresentedObject:(id)representedObject {
    [super setRepresentedObject:representedObject];

    // Update the view, if already loaded.
}

#pragma mark - Socket Connection

//- (void)connectWebSocket {
//    webSocket.delegate = nil;
//    webSocket = nil;
//    NSString *urlString = @"ws://localhost:8000";
//    SRWebSocket *newWebSocket = [[SRWebSocket alloc] initWithURL:[NSURL URLWithString:urlString]];
//    newWebSocket.delegate = self;
//    [newWebSocket open];
//}

#pragma mark - SRWebSocket delegate

//- (void)webSocketDidOpen:(SRWebSocket *)newWebSocket {
//    webSocket = newWebSocket;
//    NSString *deviceName = @"Touchpad";
//    [webSocket send:[NSString stringWithFormat:@"Hello from %@", deviceName]];
//
//}
//
//- (void)webSocket:(SRWebSocket *)webSocket didFailWithError:(NSError *)error{
//    [self connectWebSocket];
//}
//
//- (void)webSocket:(SRWebSocket *)webSocket didCloseWithCode:(NSInteger)code reason:(NSString *)reason wasClean:(BOOL)wasClean {
//    [self connectWebSocket];
//}
//
//- (void)webSocket:(SRWebSocket *)webSocket didReceiveMessage:(id)message {
//    NSLog(@"%@", [NSString stringWithFormat:@"%s\n%@", "hihih", message]);
//}

# pragma mark - SocketIO

- (void)initSocketIOConnection{
    NSURL *url = [[NSURL alloc] initWithString:@"http://localhost:3000"];
    SocketManager *manager = [[SocketManager alloc] initWithSocketURL: url config:@{@"log": @YES, @"compress": @YES}];
    SocketIOClient *socket = manager.defaultSocket;
    
    [socket on:@"connect" callback:^(NSArray* data, SocketAckEmitter* ack) {
        NSLog(@"socket connected");
    }];
    
//    [socket on:@"currentAmount" callback:^(NSArray* data, SocketAckEmitter* ack) {
//        double cur = [[data objectAtIndex:0] floatValue];
//
//        [[socket emitWithAck:@"canUpdate" with:@[@(cur)]] timingOutAfter:0 callback:^(NSArray* data) {
//            [socket emit:@"update" with:@[@{@"amount": @(cur + 2.50)}]];
//        }];
//
//        [ack with:@[@"Got your currentAmount, ", @"dude"]];
//    }];
    
    [socket connect];
}




@end
