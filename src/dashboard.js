const express = require('express');
//const itemsjs = require('../../itemsjs-server-optimized')();
const itemsjs = require('itemsjs-server-optimized')();

module.exports = function(app) {

  app.use('/libs/urijs', express.static('node_modules/urijs'));
  app.use('/libs/history.js', express.static('node_modules/history.js'));
  app.use('/libs/lodash', express.static('node_modules/lodash'));
  app.use('/assets', express.static('assets'));

  var nunenv = require('./nunenv')(app, './', {
    autoescape: true,
    watch: true,
    noCache: true
  });

  app.set('view engine', 'html.twig');
  app.set('view cache', false);
  app.engine('html.twig', nunenv.render);

  app.get('/modal-facet/:name', async function(req, res) {

    var filters = req.query.filters;
    var not_filters = req.query.not_filters;

    var facet = itemsjs.aggregation({
      name: req.params.name,
      filters: filters,
      page: req.query.page || 1,
      per_page: 100,
    });

    return res.render('views/modals-content/facet', {
      facet: facet,
      pagination: facet.pagination,
      filters: filters,
      not_filters: not_filters,
      name: req.params.name
    });
  })

  app.get('/', (req, res) => {

    var page = parseInt(req.query.page) || 1;
    var per_page = parseInt(req.query.per_page) || 30;
    var query = req.query.query;
    //var search_native = req.query.search_native;
    var facets_fields = req.query.facets_fields ? req.query.facets_fields.split(',').filter(x => !!x) : null;

    var order = req.query.order || 'desc';

    var filters = JSON.parse(req.query.filters || '{}');
    var not_filters = JSON.parse(req.query.not_filters || '{}');

    var result = itemsjs.search({
      per_page: per_page,
      page: page,
      query: query,
      order: order,
      facets_fields: facets_fields,
      search_native: true,
      not_filters: not_filters,
      filters: filters
    });

    var is_ajax = req.query.is_ajax || req.xhr;

    return res.render('views/catalog', {
      items: result.data.items,
      pagination: result.pagination,
      timings: result.timings,
      page: page,
      per_page: per_page,
      order: order,
      query: query,
      is_ajax: false,
      url: req.url,
      aggregations: result.data.aggregations,
      filters: filters,
      not_filters: not_filters,
      is_ajax: is_ajax,
    });
  })
}