#
# Copyright 2015 Red Hat, Inc.
#
# This software is licensed to you under the GNU General Public
# License as published by the Free Software Foundation; either version
# 2 of the License (GPLv2) or (at your option) any later version.
# There is NO WARRANTY for this software, express or implied,
# including the implied warranties of MERCHANTABILITY,
# NON-INFRINGEMENT, or FITNESS FOR A PARTICULAR PURPOSE. You should
# have received a copy of GPLv2 along with this software; if not, see
# http://www.gnu.org/licenses/old-licenses/gpl-2.0.txt.

require 'egon'
require 'fog'

module Actions
  module Fusor
    module Deployment
      module Rhev
        # Create the RHEV Compute Resource in Foreman
        class CreateCr < Actions::Fusor::FusorBaseAction
          def humanized_name
            _('Create the RHEV Compute Resource in Foreman')
          end

          def plan(deployment)
            super(deployment)
            plan_self(deployment_id: deployment.id)
          end

          def run
            ::Fusor.log.debug '====== RHV Compute Resource run method ======'
            deployment = ::Fusor::Deployment.find(input[:deployment_id])
            rhevm  = ::Host.find(deployment.rhev_engine_host_id).name
            api_url = "https://#{rhevm}/ovirt-engine/api/v3"
            ca_url = "http://#{rhevm}/ovirt-engine/services/pki-resource?resource=ca-certificate&format=X509-PEM-CA"
            ca_cert = "#{Net::HTTP.get(URI.parse(ca_url))}"
            rhev = { "name" => "#{deployment.label}-RHEV",
                     "location_ids" => ["", Location.where(:name => "Default Location").first.id],
                     "url" => api_url,
                     "provider" => "Foreman::Model::Ovirt", "user" => 'admin@internal',
                     "password" => deployment.rhev_root_password,
                     "organization_ids" => [deployment.organization_id],
                     "public_key" => ca_cert }
            cr = ::Foreman::Model::Ovirt.create(rhev)
            cr.uuid = cr.datacenters.find { |dc| dc[0] == deployment.rhev_data_center_name }[1]
            cr.save
            ::Fusor.log.debug '=== Leaving RHV Compute Resource run method ==='
          end

          def create_cr_completed
            ::Fusor.log.info 'Compute Resource Created'
          end

          def create_cr_failed
            fail _('Compute Resource Creation failed')
          end
        end
      end
    end
  end
end
