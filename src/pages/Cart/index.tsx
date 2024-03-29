import React, { useCallback, useState } from 'react';
import {
  MdDelete,
} from 'react-icons/md';
import { useSelector } from 'react-redux';
import { IState } from '../../store';
import { ICartItem } from '../../store/modules/cart/types';
import { formatPrice } from '../../utils/format';

import { Container, ProductTable, Total } from './styles';

import defaultImage from '../../assets/images/clothes.jpg';
import { removeProductFromCart } from '../../store/modules/cart/actions';
import { useDispatch } from 'react-redux';
import api from '../../services/api';
import { MessageModal } from '../../components/Modals/Message';

interface INewOrder {
  id: string;
  quantity: number;
}

export default function Cart() {
  const dispatch = useDispatch();
  const cart = useSelector<IState, ICartItem[]>(state => state.cart.items);
  const [message, setMessage] = useState('');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const cartTotalPrice = useSelector<IState, number>(state => {
    return state.cart.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  });

  const handleDeleteProductFromCart = useCallback((productId: string) => {
    dispatch(removeProductFromCart(productId));
  }, [dispatch]);

  function handleCloseMessageModal() {
    setIsMessageModalOpen(false);
    window.location.reload();
  }

  async function handleNewOrder() {
    let products: INewOrder[] = [];

    cart.map(item => {
      return products.push({ id: item.product.id, quantity: item.quantity });
    })

    console.log(products);

    await api.post('purchase', {
      products: products,
      totalPrice: cartTotalPrice
    }).then(() => {
      setMessage('Pedido realizado com sucesso');
      products.forEach(product => {
        handleDeleteProductFromCart(product.id);
      })
    }).catch((err) => {
      setMessage(err.response.data?.message);
    }).finally(() => {
      setIsMessageModalOpen(true);
    })
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.product.id} data-testid="product">
              <td>
                <img src={defaultImage} alt="Imagem ilustrativa padrão" />
              </td>
              <td>
                <strong>{item.product.title}</strong>
                <span>{formatPrice(item.product.price)}</span>
              </td>
              <td>
                <div>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={item.quantity}
                  />
                </div>
              </td>
              <td>
                <strong>{(item.product.price * item.quantity).toFixed(2)}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                  onClick={() => handleDeleteProductFromCart(item.product.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>

          ))}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button" onClick={handleNewOrder}>Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{formatPrice(cartTotalPrice)}</strong>
        </Total>
      </footer>

      <MessageModal
        isOpen={isMessageModalOpen}
        onRequestClose={handleCloseMessageModal}
        message={message}
      />
    </Container>
  );
};
