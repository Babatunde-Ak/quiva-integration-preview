import React from 'react';
import ComicsView from './ComicsView';

interface OffersViewProps {
  comicId?: string | null;
}

/**
 * The Offers tab: the same secondary-market editions the Comics tab shows, with "Make an offer"
 * in place of "Buy".
 *
 * They share a component because they are the same set. `createOffer` takes a listing id, so an
 * offer can only ever be made against a live listing - there is no separate pool of things to
 * bid on, and rendering one would only invite offers the contract would reject.
 */
const OffersView: React.FC<OffersViewProps> = ({ comicId }) => (
  <ComicsView comicId={comicId} mode="offer" />
);

export default OffersView;
