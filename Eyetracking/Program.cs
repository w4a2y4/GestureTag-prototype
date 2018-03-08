using System;
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
        static double mincutoff = 0.05;
        static double beta = 0.005;
        static OneEuroFilter oneEuroFilterX = new OneEuroFilter(mincutoff, beta);
        static OneEuroFilter oneEuroFilterY = new OneEuroFilter(mincutoff, beta);
        
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
        /// 

        public static void SendData(double x, double y, double ts)
        {
            if (Program.isRecording)
            {
                //Xarray[insert_index] = x;
                //Yarray[insert_index] = y;
                //kk = 0;

                //insert_index = (insert_index + 1) % 10;
                //while (kk <= 9)
                //{
                //    XData += Xarray[kk];
                //    YData += Yarray[kk];
                //    kk++;
                //}

                ////console.writeline(avex);
                //kk = 0;
                //aveX = XData / 10;
                //aveY = YData / 10;
                //socket.Emit("eyemove", aveX, aveY);


                //XData = 0.0;
                //YData = 0.0;

                aveX = oneEuroFilterX.Filter(x, 60);
                aveY = oneEuroFilterY.Filter(y, 60);
                socket.Emit("eyemove", aveX, aveY);
            }
        }

        //private static float void movingAverage()
        //{

        //} 

        //private 

        /*
         * 
         * 
      
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
        */
        public static void Write(double x, double y, double ts)
        {
            if (Program.isRecording)
            {
                Console.WriteLine("Timestamp: {0}\t X: {1} Y:{2}", ts, x, y);
                buffer.Add(string.Format("Timestamp: {0} X: {1} Y:{2}", ts, x, y));
            }
        }

    }

    public class OneEuroFilter
    {
        public OneEuroFilter(double minCutoff, double beta)
        {
            firstTime = true;
            this.minCutoff = minCutoff;
            this.beta = beta;

            xFilt = new LowpassFilter();
            dxFilt = new LowpassFilter();
            dcutoff = 1;
        }

        protected bool firstTime;
        protected double minCutoff;
        protected double beta;
        protected LowpassFilter xFilt;
        protected LowpassFilter dxFilt;
        protected double dcutoff;

        public double MinCutoff
        {
            get { return minCutoff; }
            set { minCutoff = value; }
        }

        public double Beta
        {
            get { return beta; }
            set { beta = value; }
        }

        public double Filter(double x, double rate)
        {
            double dx = firstTime ? 0 : (x - xFilt.Last()) * rate;
            if (firstTime)
            {
                firstTime = false;
            }

            var edx = dxFilt.Filter(dx, Alpha(rate, dcutoff));
            var cutoff = minCutoff + beta * Math.Abs(edx);

            return xFilt.Filter(x, Alpha(rate, cutoff));
        }

        protected double Alpha(double rate, double cutoff)
        {
            var tau = 1.0 / (2 * Math.PI * cutoff);
            var te = 1.0 / rate;
            return 1.0 / (1.0 + tau / te);
        }
    }

    public class LowpassFilter
    {
        public LowpassFilter()
        {
            firstTime = true;
        }

        protected bool firstTime;
        protected double hatXPrev;

        public double Last()
        {
            return hatXPrev;
        }

        public double Filter(double x, double alpha)
        {
            double hatX = 0;
            if (firstTime)
            {
                firstTime = false;
                hatX = x;
            }
            else
                hatX = alpha * x + (1 - alpha) * hatXPrev;

            hatXPrev = hatX;

            return hatX;
        }
    }
}