module.exports = {
  name: 'DNS Dig',
  acronym: 'DIG',
  description: 'Provides Unix-like domain information grope (dig) information',
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  styles: ['./styles/style.less'],
  entityTypes: ['domain', 'ipv4'],
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
        key: "dns",
        name: "DNS Server",
        description: "The DNS Server (host or IP) to perform lookups against.  If blank, your default DNS server will be used.  If an invalid or unreachable DNS Server is provided your `dig` requests will eventually time out.",
        default: "",
        type: "text",
        userCanEdit: true,
        adminOnly: false
    }
 ]
};
