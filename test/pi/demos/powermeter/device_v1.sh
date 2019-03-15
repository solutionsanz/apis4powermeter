while ! ifconfig | grep 192.168 > /dev/null; do

   echo "Waiting for network" >> /home/pi/demos/powermeter/log.out
   sleep 1
done

   echo "IP Network established" >> /home/pi/demos/powermeter/log.out

   python3 /home/pi/demos/powermeter/device_v1.py
