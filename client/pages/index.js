import Link from 'next/link';

const LandingPage = ({currentUser, tickets}) => {
  
  console.log('Tickets ', tickets);
  const ticketList = tickets.map(ticket => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td><Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}><a>View</a></Link></td>
      </tr>
    );
  });

  // return currentUser ? <h1>You are signed in</h1> : <h1>Your are not signed in</h1>;
  return (
    <div>
      <h1>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {ticketList}
          </tbody>
        </table>
      </h1>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  
  const {data} = await client.get('/api/tickets');
  return {tickets: data};
};

export default LandingPage