import { Router } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { inQueue } from '../views/components/queue/index'

import Report from '../views/components/report';

const router = new Router();

router.get('/', (req, res) => {
  const reportsReact = renderToString(<Report />);
  const inQueueReact = renderToString(<inQueue />);

  res.render('lobby', {
    headerActive: 'lobby',
    optionsCog: true,
    reportsReact,
    inQueueReact,
  });
});

export default router;
