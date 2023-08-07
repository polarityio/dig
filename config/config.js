module.exports = {
  name: 'NMAP',
  acronym: 'NMAP',
  description: 'Enables you to kick off a scan at the click of a button',
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  styles: ['./styles/style.less'],
  entityTypes: ['ipv4'],
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  onDemandOnly: true,
  options: [
    {
      key: 'topPorts',
      name: 'Number of the Most Popular Ports to Scan',
      description: "This setting controls how many ports will be scanned based on NMAP's built in port popularity",
      default: 64,
      type: 'number',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'privateIpOnly',
      name: 'Private IPs Only',
      description: 'If checked, the integration will only be available for private (RFC-1918) IP addresses.',
      default: false,
      type: 'boolean',
      userCanEdit: true,
      adminOnly: false
    }
  ]
};
