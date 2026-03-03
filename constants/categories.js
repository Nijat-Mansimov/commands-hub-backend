/**
 * Central management of all enums and categories
 * Single source of truth for categorization across the application
 */

// =====================================================
// ATTACK CATEGORIES HIERARCHY
// Organized by major security modules with subcategories
// =====================================================

const CATEGORIES_HIERARCHY = {
  'Nmap': [
    'Enumeration',
    'Host Discovery',
    'Host and Port Scanning',
    'Saving the Results',
    'Service Enumeration',
    'Nmap Scripting Engine (NSE)',
    'Performance',
    'Firewall and IDS/IPS Evasion'
  ],
  'Footprinting': [
    'FTP',
    'SMB',
    'NFS',
    'DNS',
    'SMTP',
    'IMAP/POP3',
    'SNMP',
    'MySQL',
    'MSSQL',
    'Oracle TNS',
    'IPMI'
  ],
  'Web Reconnaissance': [
    'WHOIS',
    'Utilizing WHOIS',
    'DNS',
    'Digging DNS',
    'Subdomains',
    'Subdomain Bruteforcing',
    'DNS Zone Transfers',
    'Virtual Hosts',
    'Certificate Transparency Logs',
    'Fingerprinting',
    'Crawling',
    'robots.txt',
    '.Well-Known URIs',
    'Creepy Crawlies',
    'Search Engine Discovery',
    'Web Archives'
  ],
  'File Transfers': [
    'Windows Methods',
    'Linux Methods',
    'Using Code',
    'Miscellaneous Methods',
    'Protected File Transfers',
    'Catching Files over HTTP/S',
    'Living off The Land',
    'Detection',
    'Evading Detection'
  ],
  'Shells & Payloads': [
    'Bind Shells',
    'Reverse Shells',
    'Introduction to Payloads',
    'Automating Payloads & Delivery',
    'Crafting Payloads',
    'Infiltrating Windows',
    'Infiltrating Unix/Linux',
    'Spawning Interactive Shells',
    'Introduction to Web Shells',
    'Laudanum Webshell',
    'Antak Webshell',
    'PHP Web Shells',
    'Live Engagement',
    'Detection & Prevention'
  ],
  'Metasploit & MSFVenom': [
    'Introduction',
    'MSFconsole',
    'Modules',
    'Targets',
    'Payloads',
    'Encoders',
    'Databases',
    'Plugins & Mixins',
    'Sessions & Jobs',
    'Meterpreter',
    'Writing & Importing Modules',
    'MSFVenom Introduction',
    'Firewall and IDS/IPS Evasion'
  ],
  'Password Attacks': [
    'Introduction',
    'Introduction to Cracking',
    'John The Ripper',
    'Hashcat',
    'Writing Custom Wordlists and Rules',
    'Cracking Protected Files',
    'Cracking Protected Archives',
    'Network Services',
    'Spraying, Stuffing, and Defaults',
    'Windows Authentication Process',
    'Attacking SAM, SYSTEM, and SECURITY',
    'Attacking LSASS',
    'Attacking Windows Credential Manager',
    'Attacking Active Directory and NTDS.dit',
    'Credential Hunting in Windows',
    'Linux Authentication Process',
    'Credential Hunting in Linux',
    'Credential Hunting in Network Traffic',
    'Credential Hunting in Network Shares',
    'Pass the Hash (PtH)',
    'Pass the Ticket (PtT) from Windows',
    'Pass the Ticket (PtT) from Linux',
    'Pass the Certificate',
    'Password Policies',
    'Password Managers'
  ],
  'Attacking Common Services': [
    'Interacting with Common Services',
    'The Concept of Attacks',
    'Service Misconfigurations',
    'Finding Sensitive Information',
    'Attacking FTP',
    'Latest FTP Vulnerabilities',
    'Attacking SMB',
    'Latest SMB Vulnerabilities',
    'Attacking SQL Databases',
    'Latest SQL Vulnerabilities',
    'Attacking RDP',
    'Latest RDP Vulnerabilities',
    'Attacking DNS',
    'Latest DNS Vulnerabilities',
    'Attacking Email Services',
    'Latest Email Service Vulnerabilities'
  ],
  'Active Directory': [
    'External Recon and Enumeration Principles',
    'Initial Enumeration of the Domain',
    'LLMNR/NBT-NS Poisoning from Linux',
    'LLMNR/NBT-NS Poisoning from Windows',
    'Password Spraying Overview',
    'Enumerating & Retrieving Password Policies',
    'Password Spraying Making a Target User List',
    'Internal Password Spraying from Linux',
    'Internal Password Spraying from Windows',
    'Enumerating Security Controls',
    'Credentialed Enumeration from Linux',
    'Credentialed Enumeration from Windows',
    'Living Off the Land',
    'Kerberoasting from Linux',
    'Kerberoasting from Windows',
    'Access Control List (ACL) Abuse Primer',
    'ACL Enumeration',
    'ACL Abuse Tactics',
    'DCSync',
    'Privileged Access',
    'Kerberos Double Hop Problem',
    'Bleeding Edge Vulnerabilities',
    'Miscellaneous Misconfigurations',
    'Domain Trusts Primer',
    'Domain Trusts Child to Parent from Windows',
    'Domain Trusts Child to Parent from Linux',
    'Domain Trusts Cross-Forest from Windows',
    'Domain Trusts Cross-Forest from Linux',
    'Hardening Active Directory',
    'Additional AD Auditing Techniques'
  ],
  'Login Brute Forcing': [
    'Introduction',
    'Password Security Fundamentals',
    'Brute Force Attacks',
    'Dictionary Attacks',
    'Hybrid Attacks',
    'Hydra',
    'Basic HTTP Authentication',
    'Login Forms',
    'Medusa',
    'Web Services',
    'Custom Wordlists'
  ],
  'Linux Privilege Escalation': [
    'Introduction',
    'Environment Enumeration',
    'Linux Services & Internals Enumeration',
    'Credential Hunting',
    'Path Abuse',
    'Wildcard Abuse',
    'Escaping Restricted Shells',
    'Special Permissions',
    'Sudo Rights Abuse',
    'Privileged Groups',
    'Capabilities',
    'Vulnerable Services',
    'Cron Job Abuse',
    'LXD',
    'Docker',
    'Kubernetes',
    'Logrotate',
    'Miscellaneous Techniques',
    'Kernel Exploits',
    'Shared Libraries',
    'Shared Object Hijacking',
    'Python Library Hijacking',
    'Sudo',
    'Polkit',
    'Dirty Pipe',
    'Netfilter'
  ],
  'Windows Privilege Escalation': [
    'Introduction',
    'Useful Tools',
    'Situational Awareness',
    'Initial Enumeration',
    'Communication with Processes',
    'Windows Privileges Overview',
    'SeImpersonate and SeAssignPrimaryToken',
    'SeDebugPrivilege',
    'SeTakeOwnershipPrivilege',
    'Windows Built-in Groups',
    'Event Log Readers',
    'DnsAdmins',
    'Hyper-V Administrators',
    'Print Operators',
    'Server Operators',
    'User Account Control',
    'Weak Permissions',
    'Kernel Exploits',
    'Vulnerable Services',
    'DLL Injection',
    'Credential Hunting',
    'Other Files',
    'Further Credential Theft',
    'Citrix Breakout',
    'Interacting with Users',
    'Pillaging',
    'Miscellaneous Techniques',
    'Legacy Operating Systems',
    'Windows Server',
    'Windows Desktop Versions',
    'Windows Hardening'
  ],
  'OWASP Top 10': [
    'A01:2021 Broken Access Control',
    'A02:2021 Cryptographic Failures',
    'A03:2021 Injection',
    'A04:2021 Insecure Design',
    'A05:2021 Security Misconfiguration',
    'A06:2021 Vulnerable and Outdated Components',
    'A07:2021 Authentication and Session Management',
    'A08:2021 Software and Data Integrity Failures',
    'A09:2021 Logging and Monitoring Failures',
    'A10:2021 Server-Side Request Forgery (SSRF)'
  ],
  'SQL & Database': [
    'SQL Injection',
    'NoSQL Injection',
    'ORM Injection',
    'Blind SQL Injection',
    'Time-Based Blind SQL Injection',
    'Boolean-Based Blind SQL Injection',
    'Error-Based SQL Injection'
  ],
  'Web Application Attacks': [
    'Stored Cross-Site Scripting',
    'Reflected Cross-Site Scripting',
    'DOM-Based Cross-Site Scripting',
    'Cross-Site Request Forgery',
    'XML External Entity',
    'File Upload Vulnerability',
    'Path Traversal',
    'Command Injection',
    'LDAP Injection',
    'OS Command Injection',
    'Template Injection',
    'Server-Side Template Injection (SSTI)',
    'Expression Language Injection',
    'Deserialization Attack',
    'Prototype Pollution',
    'HTTP Parameter Pollution',
    'Header Injection',
    'Response Splitting'
  ],
  'Authentication & Session': [
    'Broken Authentication',
    'Session Fixation',
    'Session Hijacking',
    'Credential Stuffing',
    'Brute Force Attack',
    'Default Credentials',
    'Weak Password Policy',
    'JWT Vulnerability',
    'OAuth Misconfiguration',
    'SAML Vulnerability',
    'Multi-Factor Authentication Bypass'
  ],
  'API Security': [
    'API Authentication Bypass',
    'API Rate Limiting Bypass',
    'API Version Abuse',
    'API Endpoint Enumeration',
    'GraphQL Injection',
    'REST API Abuse'
  ],
  'Cryptography': [
    'Weak Cryptographic Keys',
    'Broken Cryptography',
    'Insufficient Randomness',
    'Hash Collision',
    'Padding Oracle',
    'Timing Attack',
    'Side-Channel Attack'
  ],
  'Wireless Security': [
    'WEP/WPA Cracking',
    'WiFi Password Cracking',
    'Evil Twin Attack',
    'Rogue Access Point',
    'Deauthentication Attack',
    'WiFi Jamming',
    'Bluetooth Attack'
  ],
  'Cloud Security': [
    'Misconfiguration',
    'S3 Bucket Misconfiguration',
    'Azure Blob Storage Exposure',
    'Google Cloud Storage Exposure',
    'Privilege Escalation',
    'Credential Theft',
    'Lateral Movement',
    'Serverless Function Security',
    'Container Escape',
    'Kubernetes Attack'
  ],
  'Post-Exploitation': [
    'Data Exfiltration',
    'Privilege Escalation',
    'Lateral Movement',
    'Persistence',
    'Defense Evasion',
    'Credential Harvesting',
    'Cover Tracks',
    'Log Tampering',
    'Firewall Rule Modification'
  ],
  'Miscellaneous': [
    'Reverse Engineering Bypass',
    'DRM Bypass',
    'License Validation Bypass',
    'Social Engineering - Phishing',
    'Social Engineering - Spear Phishing',
    'Social Engineering - Whaling',
    'Social Engineering - Vishing',
    'Social Engineering - Pretexting',
    'Physical Security - Badge Cloning',
    'Physical Security - Lock Picking',
    'Physical Security - Tailgating'
  ]
};

// =====================================================
// FLATTEN CATEGORIES FOR ENUM VALIDATION
// Convert hierarchical structure to flat list for model enum
// =====================================================

const CATEGORIES_ENUM = Object.entries(CATEGORIES_HIERARCHY).flatMap(
  ([category, subcategories]) =>
    subcategories.map(sub => `${category} - ${sub}`)
);

// =====================================================
// TARGET SYSTEMS
// Platforms that can be targeted by attack payloads
// =====================================================

const TARGET_SYSTEMS = [
  'Linux',
  'Windows',
  'Active Directory',
  'Web Application',
  'Network',
  'Cloud',
  'Cross-Platform',
  'Mobile'
];

// =====================================================
// DIFFICULTY LEVELS
// Skill level required to execute the attack
// =====================================================

const DIFFICULTIES = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
];

// =====================================================
// FIELD TYPES
// Data types for command template field validation
// =====================================================

const FIELD_TYPES = [
  'text',
  'password',
  'number',
  'email',
  'url',
  'ip',
  'port',
  'domain',
  'select',
  'textarea'
];

// =====================================================
// COMMON TOOLS
// Popular tools used in attack payloads
// =====================================================

const COMMON_TOOLS = [
  'impacket',
  'netexec',
  'hashcat',
  'john',
  'nmap',
  'burp',
  'sqlmap',
  'metasploit',
  'msfvenom',
  'hydra',
  'medusa',
  'aircrack-ng',
  'wireshark',
  'nikto',
  'wfuzz',
  'gobuster',
  'dirbuster',
  'curl',
  'wget',
  'nc',
  'netcat',
  'ssh',
  'smbclient',
  'ftp',
  'telnet',
  'ldapsearch',
  'dig',
  'nslookup',
  'whois',
  'kerbrute',
  'responder',
  'crackmapexec'
];

// =====================================================
// COMMON PROTOCOLS
// Protocols used in attack payloads
// =====================================================

const COMMON_PROTOCOLS = [
  'Kerberos',
  'NTLM',
  'LDAP',
  'RPC',
  'HTTP',
  'HTTPS',
  'SSH',
  'SMB',
  'DNS',
  'FTP',
  'SFTP',
  'Telnet',
  'RDP',
  'IMAP',
  'POP3',
  'SMTP',
  'SNMP',
  'OAuth',
  'SAML',
  'JWT',
  'TLS',
  'SSL',
  'WinRM',
  'SOAP',
  'REST',
  'GraphQL',
  'WebSocket'
];

// =====================================================
// FIELD TYPE VALIDATION RULES
// Validation patterns and messages for each field type
// =====================================================

const FIELD_TYPE_RULES = {
  text: {
    pattern: /^.+$/,
    message: 'Field cannot be empty'
  },
  password: {
    pattern: /^.+$/,
    message: 'Password cannot be empty'
  },
  number: {
    pattern: /^-?\d+(\.\d+)?$/,
    message: 'Must be a valid number'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Must be a valid email address'
  },
  url: {
    pattern: /^https?:\/\/.+/i,
    message: 'Must be a valid URL (start with http:// or https://)'
  },
  ip: {
    pattern: /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i,
    message: 'Must be a valid IPv4 or IPv6 address'
  },
  port: {
    pattern: /^\d+$/,
    message: 'Must be a valid port number (1-65535)',
    min: 1,
    max: 65535
  },
  domain: {
    pattern: /^([a-z0-9](-[a-z0-9])*\.)+[a-z]{2,}$/i,
    message: 'Must be a valid domain name'
  },
  select: {
    message: 'Must select a valid option'
  },
  textarea: {
    pattern: /^.+$/s,
    message: 'Field cannot be empty'
  }
};

// =====================================================
// EXPORTS
// Make all enums available for import
// =====================================================

module.exports = {
  CATEGORIES_HIERARCHY,
  CATEGORIES_ENUM,
  TARGET_SYSTEMS,
  DIFFICULTIES,
  FIELD_TYPES,
  COMMON_TOOLS,
  COMMON_PROTOCOLS,
  FIELD_TYPE_RULES,
  
  // Helper functions
  
  /**
   * Get all major categories
   * @returns {string[]} Array of major category names
   */
  getMajorCategories() {
    return Object.keys(CATEGORIES_HIERARCHY);
  },
  
  /**
   * Get subcategories for a major category
   * @param {string} majorCategory - The major category name
   * @returns {string[]} Array of subcategories
   */
  getSubcategories(majorCategory) {
    return CATEGORIES_HIERARCHY[majorCategory] || [];
  },
  
  /**
   * Validate if a category exists in the hierarchy
   * @param {string} category - The full category string (e.g., "Nmap - Enumeration")
   * @returns {boolean} True if category exists
   */
  isValidCategory(category) {
    return CATEGORIES_ENUM.includes(category);
  },
  
  /**
   * Parse a category string into major and sub components
   * @param {string} category - The full category string
   * @returns {object} Object with major and subcategory
   */
  parseCategory(category) {
    const parts = category.split(' - ');
    if (parts.length === 2) {
      return {
        major: parts[0],
        subcategory: parts[1]
      };
    }
    return null;
  }
};
