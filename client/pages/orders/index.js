

const OrderIndex = ({orders, currentUser}) => {

  return (
    <ul>
      {orders.map(order => {
        return (
          <li>
            {order.ticket.title} - {order.status}
          </li>
        );
      })}
    </ul>
  );
};

OrderIndex.getInitialProps = async (context, client) => {

  const {data} = await client.get('/api/orders');
  return {orders: data};
};

export default OrderIndex;