# Polarity Dig Integration

![mode:on demand only](https://img.shields.io/badge/mode-on%20demand%20only-blue.svg)

> This integration should only be run in `On Demand Only` mode

| ![image](assets/overlay_ip.png) | ![image](assets/overlay_domain.png) 
|---| --- | 
|*dig IP information* | *dig domain information* |


The Polarity dig integration leverages the "node-dig-dns" library which provides a simple node wrapper for the unix/linux/macos dig command (domain information grope).  

For domains this integration runs the dig command:
```
dig <domain> ANY @dns-server
```

For IP Addresses this integration does a reverse lookup:

```
dig -x <ip-address> ANY @dns-server
```

For this integration to work you must have the `dig` command line tool installed on your Polarity Server.  To install `dig` you can install the `bind-tools` package via `yum`:

```
sudo yum install bind-tools -y
```

## Dig Integration Options

### DNS Server
The DNS Server to perform lookups against. If blank, your default DNS server will be used.

## About Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making.  For more information about the Polarity platform please see:

https://polarity.io/
