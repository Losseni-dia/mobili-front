export const CONFIGURATION_DATA = {
  environments: [
    {
      env: 'local',
      domain: ['localhost:4200']
    },
    {
      env: 'dev',
      domain: ['mobili.dev.ecode.be']
    }
  ],
  variables: {
    'local': {
      apiUrl: "http://localhost:8080/v1", 
    },
    'dev': {
      apiUrl: "http://mobili.dev.ecode.be/v1",
    }
  }
};