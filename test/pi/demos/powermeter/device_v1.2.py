import requests
import datetime
import time
import random
import json

apps_url = "https://xx.xx.xx.xx/apis4powermeter/devices/"
#comms_url = "https://xx.xx.xx.xx/sms"

eventDateTime = datetime.datetime.today().strftime("%Y-%m-%d-%H.%M.%S")
device_event_group = ['UP','OUTAGE','LOW POWER','HIGH POWER','TAMPER']
device_name_group = ['Device101','Device102','Device103','Device104','Device105']
device_model_group = ['Y Box','Envoy','Envoy Ambassador','Z Box','Envoy B']
device_manager_group = ['Origin', 'AGL','Green Energy','Spark Energy','Clean Energy']

device_doc = {
  "device": {
    "device_event": "UP",
    "device_temp": 89,
    "device_battery_pct": 80,
    "device_usage": 70,
    "device_lat": -37.835311,
    "device_long": 144.9725336,
    "ddevice_date_time": "2018-07-29 09:17:13.812189",
    "device_name": "Device100",
    "device_model": "MH 107",
    "device_manager": "Origin"
  }

}
myOwner = "Franco Ucci"
myPhone = "+614xxxxxxxx"
myLocation = "Adelaide Oval"
myAction = "Camera"+str(random.randrange(10,40))

for i in range(100,109,1):


    device_doc["device"]["device_event"]=device_event_group[random.randrange(0,4)]
    device_doc["device"]["device_temp"]=random.randrange(80,120)
    device_doc["device"]["device_battery_pct"]=random.randrange(20,100)
    device_doc["device"]["device_usage"]=random.randrange(20,100)
    device_doc["device"]["device_lat"]=round(random.uniform(-37.5121,-38.9123),4)
    device_doc["device"]["device_long"]=round(random.uniform(144.972533,145.9725336),4)
    device_doc["device"]["ddevice_date_time"]=str(eventDateTime)
    device_doc["device"]["device_name"]=device_name_group[random.randrange(0,4)]
    device_doc["device"]["device_model"]=device_model_group[random.randrange(0,4)]
    device_doc["device"]["device_manager"]=device_manager_group[random.randrange(0,4)]

    print (json.dumps(device_doc))

    # Apps Input for Visibility Section *** Needs work
    deviceEventUrl = apps_url+str(i)
    print ('Apps url '+deviceEventUrl)
    resp = requests.post( deviceEventUrl,  data=json.dumps(device_doc), headers={'Content-Type': 'application/json'})
    print ("Response Code ", resp)

    ### Comms Sectionstr(resp.status_code), resp.headers
    #myText = "Hey " + myOwner + "  have sent a Device Event: " + device_doc["device"]["device_event"] + " for your follow up"
    #sendSMS = '{"to":"' + myPhone + '","msg":"' + myText + '"}'
    #resp = requests.post(comms_url, data=sendSMS, headers={'Content-Type': 'application/json'})
    
    time.sleep(2)