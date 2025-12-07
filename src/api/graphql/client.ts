import { HttpLink } from '@apollo/client';
import {ApolloClient, InMemoryCache} from '@apollo/client';

export const testClient = new ApolloClient({
   link: new HttpLink({ uri:"https://spacex-production.up.railway.app/"}),
    cache: new InMemoryCache()
})