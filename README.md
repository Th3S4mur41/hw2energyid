# HomeWizard to EnergyId

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?machine=basicLinux32gb&repo=612398925&ref=main)

![Package version](https://img.shields.io/github/package-json/v/Th3S4mur41/hw2energyid)
![GitHub last commit](https://img.shields.io/github/last-commit/Th3S4mur41/hw2energyid)
![Release](https://github.com/Th3S4mur41/hw2energyid/actions/workflows/on_push.yml/badge.svg?branch=main)

**hw2energyid** is small tool to synchronize data from [HomeWizard](https://www.homewizard.com/) devices to your [EnergyID](https://app.energyid.eu/) dashboard.

Since HomeWizard devices API are only available within your local network, using an [EnergyID App](https://app.energyid.eu/integrations) to synchronize the data is not possible.  
**hw2energyid** helps bridge the gap by reading the data from your local network and sending them to EnergyId using the WebHook App

## Prerequisites

### EnergyID
Before you start, you need to create a webhook in EnergyID to let the tool push the data to your dashboard.

1. Go to the [EnergyId incoming webhook page](https://app.energyid.eu/integrations/WebhookIn) and click activate.
2. Pick the record you would like to send readings to (e.g.: Home), and provide a name for your application or device (e.g.: HomeWizard).
3. Copy the generated Webhook URL.

### Node

To run the tool, you will also need to have [NodeJS](https://nodejs.org/en/download) installed

## Usage

### P1 Meter

The HomeWizard [P1 Meter](https://www.homewizard.com/p1-meter/) connects into the P1 port on your smart meter and shows your electricity and gas usage.

> **Note**  
> hw2energyid currently only supports synchronizing electricity readings

The P1 meter can be discoverd on your network using [Multicast DNS (mDNS)](https://www.ionos.com/digitalguide/server/know-how/multicast-dns/).  
The name of the device is 'hw-p1meter-' followed by the last six charachters of its serial number.

> **Note**  
> To find the serial number, open your HomeWizard Energy App.  
> Then go to Settings > Meters > P1 meter
> ![P1 Serial Number](./docs/p1_sn.png)

Now that you have all the data you need. Open a terminal/console and run the following script:

```sh
npx hw2energyid --p1=hw-p1meter-<last 6 charachter of serial> --energyid=<url of the webhook>
```

#### Example
The command with your data should look similar to this:
```sh
npx hw2energyid --p1=hw-p1meter-65d8c7 --energyid=https://hooks.energyid.eu/services/WebhookIn/46535693-fe25-48ba-96fa-ea827e987318/OS753GD97A11
```

## Links

[homewizard dicovery docs](https://homewizard-energy-api.readthedocs.io/discovery.html)  
[EnergyId Webhook Docs](https://api.energyid.eu/docs.html#webhook)
