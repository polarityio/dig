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
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: '',
    rejectUnauthorized: true
  },
  onDemandOnly: true,
  options: [
    {
      key: 'dns',
      name: 'DNS Server',
      description:
        "The DNS Server (host or IP) to perform lookups against.  If left blank, the Polarity Server's default DNS server will be used.  If an invalid or unreachable DNS Server is provided your `dig` requests will eventually time out.  Defaults to `8.8.8.8`.",
      default: '8.8.8.8',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'privateIpOnly',
      name: 'Private IPs Only',
      description: 'If checked, the integration will only look up private (RFC-1918) IP addresses.  Domains will still be looked up unless you turn domains off via the "Manage Integration Data" option.',
      default: false,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'queryTypes',
      name: 'DNS Query Types for Domains',
      description:
        'One or more query types to run via dig.  Each selected type requires a separate query to your DNS server.  If no types are selected an A Record query will be issued.  Query types only apply to domains as IPs will always be a PTR query.',
      default: [
        {
          value: 'A',
          display: 'A (IPv4)'
        }
      ],
      type: 'select',
      options: [
        {
          value: 'A',
          display: 'A (IPv4)'
        },
        {
          value: 'AAAA',
          display: 'AAAA (IPv6)'
        },
        {
          value: 'NS',
          display: 'NS (Name Server)'
        },
        {
          value: 'MX',
          display: 'MX (Mail Exchange)'
        },
        {
          value: 'TXT',
          display: 'TXT (Text Annotations)'
        },
        {
          value: 'SOA',
          display: 'SOA (Start of Authority)'
        },
        {
          value: 'CNAME',
          display: 'CNAME (Canonical Name Record)'
        }
      ],
      multiple: true,
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'resultsToShow',
      name: 'Results Filter',
      description:
        'Choose which results are displayed.  Defaults to always showing a result.  Can also be set to only show results with an Answer section, or to only show results with an Answer or Authority section.',
      default: {
        value: 'always',
        display: 'Always show a result'
      },
      type: 'select',
      options: [
        {
          value: 'always',
          display: 'Always show a result'
        },
        {
          value: 'answerOrAuthority',
          display: 'Only show results with an answer or an authority section'
        },
        {
          value: 'answerOnly',
          display: 'Only show results with an answer section'
        }
      ],
      multiple: false,
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
