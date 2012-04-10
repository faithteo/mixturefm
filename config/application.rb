require File.expand_path('../boot', __FILE__)

require "action_controller/railtie"
require "action_mailer/railtie"
require "active_resource/railtie"
require "rails/test_unit/railtie"
require "sprockets/railtie"

if defined?(Bundler)
  Bundler.require(*Rails.groups(:assets => %w(development test)))
end

$mixture_config = YAML.load_file("config/mixture.yml")[Rails.env].symbolize_keys
HOST            = $mixture_config[:host]

module Mixture
  class Application < Rails::Application
    # require 'rack/raw_upload'

    # config.middleware.use 'Rack::RawUpload', explicit: true
    config.middleware.use OmniAuth::Builder do
      provider :facebook, ENV['FACEBOOK_APP_ID'], ENV['FACEBOOK_APP_SECRET']
      configure do |config|
        config.path_prefix = '/api/v0/auth'
      end
    end

    config.action_mailer.delivery_method   = :postmark
    config.action_mailer.postmark_settings = { api_key: ENV['POSTMARK_API_KEY'] }

    config.mongoid.observers = :mix_observer, :performer_observer, :mix_collection_observer

    config.generators do |g|
      g.test_framework      :test_unit, fixture_replacement: :fabrication
      g.fixture_replacement :fabrication, dir: "test/fabricators"
    end

    config.encoding = "utf-8"
    config.filter_parameters += [:password]
    config.assets.enabled = true
    config.assets.version = '1.0'

    config.autoload_paths += ["./app/jobs", "./app/uploaders", "./app/observers"]
  end
end