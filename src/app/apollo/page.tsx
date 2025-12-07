'use client'
import React from 'react'
import { ApolloProvider} from '@apollo/client/react';
import { testClient } from '@/api/graphql/client';
import Apollo from './Apollo';
export default function Page() {
  return (
    <ApolloProvider client={testClient}>
        <Apollo/>
    </ApolloProvider>
  )
}
