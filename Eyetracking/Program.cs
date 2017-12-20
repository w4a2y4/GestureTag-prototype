using System;
using System.IO;
using System.Collections.Generic;
using Tobii.Interaction;
using Quobject.SocketIoClientDotNet.Client;


namespace Interaction_Streams_101
{
    /// <summary>
    /// The data streams provide nicely filtered eye-gaze data from the eye tracker 
    /// transformed to a convenient coordinate system. The point on the screen where 
    /// your eyes are looking (gaze point), and the points on the screen where your 
    /// eyes linger to focus on something (fixations) are given as pixel coordinates 
    /// on the screen. The positions of your eyeballs (eye positions) are given in 
    /// space coordinates in millimeters relative to the center of the screen.
    /// 
    /// Let's see how is simple to find out where are you looking at the screen
    /// using GazePoint data stream, accessible from Streams property of Host instance.
    /// </summary>
    public class Program
    {
        static int count = 0;
        static double XData = 0.0;
        static double YData = 0.0;

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

        public  static void SendData(double x,double y,double ts)
        {
            if (Program.isRecording)
            {
                while (count<10)
                {
                    XData +=x;
                    YData += y;
                    count++;
                }
                if (count >= 10)
                {
                    double aveX = XData / 10.0;
                    double aveY = YData / 10.0;
                    count = 0;
                    XData = 0.0;
                    YData = 0.0;
                    socket.Emit("eyemove", 1920 + aveX, aveY);
                }
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
