import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { parseCookies } from 'nookies';

export function withSSRGuest<P>(fn: GetServerSideProps<P>): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext,
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    if (cookies['nextauth.token']) {
      // validar em chamada pra api se o token recuperado é válido
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    }

    return fn(ctx);
  };
}
