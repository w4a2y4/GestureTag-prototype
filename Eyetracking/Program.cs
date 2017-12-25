﻿using System;
using System.IO;
using System.Collections.Generic;
using Tobii.Interaction;
using Quobject.SocketIoClientDotNet.Client;


namespace Interaction_Streams_101
{
    public class Program
    {
        static int insert_index = 9;
        static int kk=0;
        static int count = 0;
        static double XData = 0.0;
        static double YData = 0.0;
        static double XXData = 0.0;
        static double YYData = 0.0;
        static double aveX, aveY, aveYY, aveXX;
        static double[] Xarray = { 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 };
        static double[] Yarray = { 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 };
        static bool isRecording = false;
        static List<string> buffer = new List<string>();
        static string log_file_name = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments) + @"\New_eye_tracking_log.txt";
        static Socket socket;
        public static void Main(string[] args)
        {
            // Everything starts with initializing Host, which manages connection to the 
            // Tobii Engine and provides all the Tobii Core SDK functionality.
            // NOTE: Make sure that Tobii.EyeX.exe is running
            var host = new Host();
            Console.WriteLine("Save into {0}", log_file_name);

            // 2. Create stream. 
            var gazePointDataStream = host.Streams.CreateGazePointDataStream();
            socket = IO.Socket("http://localhost:3000/");
            // 3. Get the gaze data!
            gazePointDataStream.GazePoint((x, y, ts) => Write(x, y, ts));
            gazePointDataStream.GazePoint((x, y, ts) => SendData(x, y, ts));

            while (true)
            {
                ConsoleKey key = Console.ReadKey().Key;
                if (key == System.ConsoleKey.Escape)
                    break;
                Program.isRecording = !Program.isRecording;
                if(!Program.isRecording)
                { 
                    // write buffer to file and clear buffer
                    using (StreamWriter outputFile = new StreamWriter(log_file_name, true))
                    {
                        string[] lines = buffer.ToArray();
                        foreach (string line in lines)
                            outputFile.WriteLine(line);
                        outputFile.Write("@"); // write an specfic symbol to separate the time block
                        Console.WriteLine(" write {0} lines to file.", buffer.Count);
                        outputFile.WriteLine("");
                        buffer.Clear();
                    }
                }
            }

            // we will close the coonection to the Tobii Engine before exit.
            host.DisableConnection();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="x"></param>
        /// <param name="y"></param>
        /// <param name="ts"></param>
        public  static void SendData(double x,double y,double ts)
        {
            if (Program.isRecording)
            {
                Xarray[insert_index] = x;
                Yarray[insert_index] = y;
                kk = 0;

                insert_index = (insert_index + 1) % 10;
                while (kk <= 9)
                {
                    XData += Xarray[kk];
                    YData += Yarray[kk];
                    kk++;
                }

                //Console.WriteLine(aveX);
                kk = 0;
                aveX = XData / 10;
                aveY = YData / 10;

                while (count<3)
                {
                    XXData +=aveX;
                    YYData += aveY;
                    count++;
                }
                if (count >= 3)
                {
                    double aveXX = XXData / 3.0;
                    double aveYY = YYData / 3.0;
                    count = 0;
                    XXData = 0.0;
                    YYData = 0.0;
                    socket.Emit("eyemove", aveXX, aveYY);
                }

                XData = 0.0;
                YData = 0.0;
            }
        }

        public static void Write(double x, double y, double ts)
        {
            if (Program.isRecording)
            {
                Console.WriteLine("Timestamp: {0}\t X: {1} Y:{2}", ts, x, y);
                buffer.Add(string.Format("Timestamp: {0} X: {1} Y:{2}", ts, x, y));
            }
        }

    }
}