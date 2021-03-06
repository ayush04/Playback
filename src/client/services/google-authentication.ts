export class GoogleAuthentication {
    private static _isAuthenticated: boolean = window.sessionStorage.getItem('google-authenticated') === 'true'? true: false;

    static isAuthenticated(): boolean {
        return GoogleAuthentication._isAuthenticated;
    }

    static authenticate(): Promise<any> {
        return new Promise((resolve, reject) => {
            gapi.load('auth2', () => {
                fetch('http://playback.io:3000/secret/id')
                    .then(response => response.json())
                    .then(responseJson => {
                        // @ts-ignore
                        gapi.auth2.getAuthInstance({
                            client_id: responseJson.CLIENT_ID
                        });
                        
                        // @ts-ignore
                        return gapi.auth2.getAuthInstance().signIn({
                            scope: 'https://www.googleapis.com/auth/youtube.force-ssl'
                        }).then(() => {
                            GoogleAuthentication._isAuthenticated = true;
                            window.sessionStorage.setItem('google-authenticated', 'true');
                            console.log('Authenticated');
                            return resolve(GoogleAuthentication.loadClient());
                        }).catch((err: Error) => {
                            console.log(err);
                            return reject(true);
                        });
                    });
            });
        });
    }

    static loadClient() {
        return new Promise((resolve, reject) => {
            gapi.load('client', () => {
                fetch('http://playback.io:3000/secret/key')
                    .then(response => response.json())
                    .then(responseJson => {
                        gapi.client.setApiKey(responseJson.API_KEY);
                        return resolve(gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest", "v3"));
                    });
            });
        });
    }
}